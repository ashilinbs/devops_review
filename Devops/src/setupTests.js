// filepath: /home/vibudesh/Hackathon/Devops_Training/Devops/src/setupTests.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;