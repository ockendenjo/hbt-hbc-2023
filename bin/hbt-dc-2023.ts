#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {HbtHalloween2023Stack} from '../lib/hbt-halloween2023-stack';

const app = new cdk.App();
new HbtHalloween2023Stack(app, 'HbtHalloween2023Stack', {
    env: {account: "574363388371", region: "eu-west-1"}
});
