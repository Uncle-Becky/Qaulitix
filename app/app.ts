import { Application } from '@nativescript/core';
import { initializeModels } from './models/init';

// Initialize models before app start
const models = initializeModels();

Application.run({ moduleName: 'app-root' });