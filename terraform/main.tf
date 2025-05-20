provider "aws" {
  region = "us-east-1"
}

# Existing VPC and Subnet
data "aws_vpc" "existing" {
  id = "vpc-0ab7b2bd2753c10d9"
}

data "aws_subnet" "existing" {
  id = "subnet-00d023f35b33e1fc6"
}

# Get existing Internet Gateway
data "aws_internet_gateway" "existing" {
  filter {
    name   = "attachment.vpc-id"
    values = [data.aws_vpc.existing.id]
  }
}

# Existing Security Groups
data "aws_security_group" "existing_sg_1" {
  filter {
    name   = "group-name"
    values = ["new"]
  }
  vpc_id = data.aws_vpc.existing.id
}

data "aws_security_group" "existing_sg_2" {
  filter {
    name   = "group-name"
    values = ["launch-wizard-1"]
  }
  vpc_id = data.aws_vpc.existing.id
}

# Route table and public route
resource "aws_route_table" "public_rt" {
  vpc_id = data.aws_vpc.existing.id
}

resource "aws_route" "default_route" {
  route_table_id         = aws_route_table.public_rt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = data.aws_internet_gateway.existing.id
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = data.aws_subnet.existing.id
  route_table_id = aws_route_table.public_rt.id
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "ecs-ec2-cluster"
}

# IAM Role for EC2 to interact with ECS
resource "aws_iam_role" "ecs_instance_role" {
  name = "ecs-instance-role74"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_instance_policy" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ecs-instance-profile-nw2"
  role = aws_iam_role.ecs_instance_role.name
}

# ECS-Optimized AMI
data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

# Launch Template
resource "aws_launch_template" "ecs_lt" {
  name_prefix   = "ecs-launch-template"
  image_id      = data.aws_ssm_parameter.ecs_ami.value
  instance_type = "t2.micro"

  vpc_security_group_ids = [
    data.aws_security_group.existing_sg_1.id,
    data.aws_security_group.existing_sg_2.id
  ]

  iam_instance_profile {
    arn = aws_iam_instance_profile.ecs_instance_profile.arn
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo "ECS_CLUSTER=${aws_ecs_cluster.main.name}" >> /etc/ecs/ecs.config
  EOF
  )
}


# Auto Scaling Group
resource "aws_autoscaling_group" "ecs" {
  vpc_zone_identifier       = [data.aws_subnet.existing.id]
  desired_capacity          = 1
  min_size                  = 1
  max_size                  = 3
  health_check_grace_period = 0
  health_check_type         = "EC2"

  launch_template {
    id      = aws_launch_template.ecs_lt.id
    version = aws_launch_template.ecs_lt.latest_version
  }

  tag {
    key                 = "Name"
    value               = "demo-ecs-cluster"
    propagate_at_launch = true
  }
}

# Capacity Provider
resource "aws_ecs_capacity_provider" "ecs_cp" {
  name = "my-capacity-provider-n23"

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.ecs.arn
    managed_termination_protection = "DISABLED"

    managed_scaling {
      maximum_scaling_step_size = 2
      minimum_scaling_step_size = 1
      status                     = "ENABLED"
      target_capacity            = 100
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "ecs_cp_attach" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [aws_ecs_capacity_provider.ecs_cp.name]

  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.ecs_cp.name
    weight            = 100
    base              = 1
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "main" {
  family                   = "my-task-def"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  memory                   = "512"
  cpu                      = "1024"

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([{
    name      = "my-container"
    image     = "307946674949.dkr.ecr.us-east-1.amazonaws.com/my-app-repo:latest"
    essential = true
    memory    = 512
    cpu       = 1024
    portMappings = [{
      containerPort = 80
      hostPort      = 80
      protocol      = "tcp"
    }]
  }])
}

# ECS Service
resource "aws_ecs_service" "main" {
  name            = "ecs-ec-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 1

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.ecs_cp.name
    weight            = 1
  }

  deployment_controller {
    type = "ECS"
  }

  depends_on = [aws_ecs_cluster_capacity_providers.ecs_cp_attach]
}
