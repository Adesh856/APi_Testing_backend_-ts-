"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const db_1 = __importDefault(require("./db"));
app.use(express.json());
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
app.listen(process.env.port, () => {
    db_1.default.getInstance();
    console.log(`Server is connected on http://localhost:${process.env.port}`);
});
