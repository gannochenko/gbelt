#!/usr/bin/env node

import { Application } from './lib/application';

const app = new Application();
app.run().catch(error => {
    console.error(error.stack);
});

