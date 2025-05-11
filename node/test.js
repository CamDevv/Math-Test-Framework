// Created by Mr. CV2 :) - https://github.com/CamDevv/Math-Test-Framework
// This is the Node.js application for MTF

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const studentsFilePath = 'students.txt';
const scoresFilePath = 'scores.txt';
const testConfigFilePath = 'testconfig.txt';

function toCamelCase(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function readFileLines(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
    }
    return [];
}

function prompt(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans.trim());
    }));
}

(async function main() {
    // Load students
    const studentInfo = {};
    const studentLines = readFileLines(studentsFilePath);
    studentLines.forEach(line => {
        const [name, id, completed] = line.split(':').map(v => v.trim());
        studentInfo[name] = { id, completed: completed.toLowerCase() === 'true' };
    });

    // Load test config
    const testConfig = {};
    readFileLines(testConfigFilePath).forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, value] = line.split(':').map(s => s.trim());
            testConfig[key] = value;
        }
    });

    // Parse config
    const numQuestions = parseInt(testConfig['How Many Questions On The Test'] || '2', 10);
    const testFocus = (testConfig['Test Focus'] || 'ADDITION').toUpperCase();
    const [rangeMin, rangeMax] = (testConfig['Range'] || '1,10').split(',').map(Number);
    const studentIdLength = parseInt(testConfig['Student ID Length'] || '8', 10);
    const completionMessage = testConfig['Completion Message'] || 'You have already completed the test. You cannot retake it.';

    if (!['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION'].includes(testFocus)) {
        console.log('Invalid test focus.');
        return;
    }

    // Generate questions
    const questions = [];
    for (let i = 0; i < numQuestions; i++) {
        let f1 = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
        let f2 = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
        let answer;
        if (testFocus === 'DIVISION') {
            f2 = f2 === 0 ? 1 : f2;
            answer = Math.floor(f1 / f2);
        } else if (testFocus === 'SUBTRACTION') {
            answer = f1 - f2;
        } else if (testFocus === 'MULTIPLICATION') {
            answer = f1 * f2;
        } else {
            answer = f1 + f2;
        }
        questions.push({ f1, f2, answer });
    }

    console.log("MATH TEST\n======================\n");

    let testTakerName = await prompt("Enter your name: ");

    if (/\d/.test(testTakerName)) {
        console.log("The provided test taker name contains digits and is invalid.");
        return;
    }

    const nameWords = testTakerName.trim().split(/\s+/);
    if (nameWords.length !== 2) {
        console.log("The provided test taker name should consist of exactly two words.");
        return;
    }

    const correctedName = toCamelCase(testTakerName);
    testTakerName = correctedName;

    if (!studentInfo[testTakerName]) {
        console.log("The provided test taker is not registered.");
        return;
    }

    if (studentInfo[testTakerName].completed) {
        console.log(completionMessage);
        return;
    }

    let studentId;
    while (true) {
        studentId = await prompt(`Enter your Student ID (${studentIdLength} digits): `);
        if (studentId.length === studentIdLength && /^\d+$/.test(studentId)) break;
        console.log("Invalid Student ID format.");
    }

    if (studentInfo[testTakerName].id !== studentId) {
        console.log("The provided Student ID does not match the registered ID for", testTakerName);
        return;
    }

    console.log("Taking test as:", testTakerName);

    const startTime = Date.now();

    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < questions.length; i++) {
        const { f1, f2, answer } = questions[i];
        let promptText;
        switch (testFocus) {
            case 'ADDITION': promptText = `${f1} + ${f2} = `; break;
            case 'SUBTRACTION': promptText = `${f1} - ${f2} = `; break;
            case 'MULTIPLICATION': promptText = `${f1} * ${f2} = `; break;
            case 'DIVISION': promptText = `${f1} / ${f2} = `; break;
        }
        const attempt = await prompt(`Question ${i + 1}/${numQuestions}: ${promptText}`);
        if (!isNaN(attempt) && parseInt(attempt, 10) === answer) {
            correct++;
        } else {
            incorrect++;
        }
    }

    const endTime = Date.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

    // Mark completed
    studentInfo[testTakerName].completed = true;
    fs.writeFileSync(studentsFilePath, Object.entries(studentInfo)
        .map(([name, info]) => `${name}:${info.id}:${info.completed}`).join('\n'));

    // Append scores
    const scoreLine = `${testTakerName} - ${numQuestions} - ${rangeMin}-${rangeMax} - ${correct} - ${correct} - ${incorrect} - ${timeTaken}\n`;
    fs.appendFileSync(scoresFilePath, scoreLine);

    // Final Output
    console.log("\nTOTAL SCORE:", correct);
    console.log("QUESTIONS ANSWERED CORRECTLY:", correct);
    console.log("QUESTIONS ANSWERED INCORRECTLY:", incorrect);
    console.log("TIME TAKEN:", timeTaken, "seconds");

})();