const { CognitoUserPool } = require('amazon-cognito-identity-js');
require("dotenv").config();
const poolData = {
    UserPoolId: process.env.UserPoolId,
    ClientId: process.env.ClientId
}

module.exports = new CognitoUserPool(poolData);