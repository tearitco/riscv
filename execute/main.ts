import * as fs from 'fs';
import { addZeros } from './helperFun';
import {RegisterFile} from './main';

let PC: number, IR: string, pcTemp: number, regFile:RegisterFile;
let selectLineB, selectLineY0, selectLineY1;
let instructionMap: Map<number, string> = new Map<number, string>();
let opcodeMap: Map<string, string> = new Map<string, string>();

// func to map opcode with corresponding instruction type
function refMapForOpcode(opcodeMap: Map<String, string>){
    // R type
    opcodeMap.set('0110011', 'R');
    // I type
    opcodeMap.set('0010011', 'I');
    opcodeMap.set('0000011', 'I');
    opcodeMap.set('1100111', 'I');
    // S type
    opcodeMap.set('0100011', 'S');
    // SB type
    opcodeMap.set('1100011', 'SB');
    // U type
    opcodeMap.set('0110111', 'U');
    opcodeMap.set('0010111', 'U');
    // UJ type
    opcodeMap.set('1101111', 'UJ');
}
refMapForOpcode(opcodeMap);

function init(): void {
    // let data = fs.readFileSync(__dirname + "/test/data.m", { encoding: "utf-8" });
    let data = fs.readFileSync('test/test.mc', {encoding: 'utf-8'});
    let dataArr = data.split('\n');
    let i = 0;
    // Loading all instructions of program into instructionMap
    while (dataArr[i]) {
        let key = parseInt(dataArr[i].split(" ")[0], 16);
        // console.log(key);
        let value = dataArr[i].split(" ")[1];
        // console.log(value);
        instructionMap.set(key, value);
        i++;
    }
    // Initializing Register File
    regFile = new RegisterFile();
    // Setting pc and instrReg
    PC = 0;
    // instrReg = instructionMap.get(0);
    // console.log(instructionMap.get(4));
    while (1) {
        fetch();
        decode();
    }

}

init();


function determineSelectLines(opcode: string) {
    // If the instruction is R type then selectLineB = 0
    if (opcode == '0110011') {
        selectLineB = 0;
    } else {
        selectLineB = 1;
    }
    // If the instruction is auipc then selectLineY1 = 1
    if (opcode == "0010111") {
        selectLineY1 = 1;
    } else {
        selectLineY1 = 0;
    }
    // If the instruction is lw, lh, lb, ld then selectLineY0 = 1
    if (opcode == "0000011") {
        selectLineY0 = 1;
    } else {
        selectLineY0 = 0;
    }
}

// program counter pc register which holds the address of the current instruction
function fetch() {
    // Fetching the current Instruction
    let temp = instructionMap.get(PC);
    // Terminating Condition 
    if (!temp) {
        // TODO: Write Data Memory
        process.exit(0);
    }
    temp = parseInt(temp, 16).toString(2);
    temp = addZeros(temp, 32);
    // console.log(temp);
    // console.log("try");
    IR = temp;
    pcTemp = PC;
    // TODO: Updating PC
    PC += 4;
    // TODO: constructing immediate value and passing to MuxB
    // TODO: constructing immediate value and passing to MuxINC for Branch Instructions

}


function decode() {
    // extracting opcode of current instruction
    let opcode = IR.slice(25, 32);
    // instruction type of current instruction
    let type = opcodeMap.get(opcode);

    if(type == 'R'){
        let rd = IR.slice(20, 25);
        regFile.setRD(rd);

        let rs1 = IR.slice(12, 17);
        regFile.setRS1(rs1);

        let rs2 = IR.slice(7 ,12)
        regFile.setRS2(rs2);
        console.log(regFile.getRS2());
    }
    else if(type == 'I'){
        let rd = IR.slice(20, 25);
        regFile.setRD(rd);

        let rs1 = IR.slice(12, 17);
        regFile.setRS1(rs1);

        let imm = IR.slice(0, 12);
        console.log(imm);
    }
    else if(type == 'S'){
        let rs1 = IR.slice(12, 17);
        regFile.setRS1(rs1);

        let rs2 = IR.slice(7 ,12)
        regFile.setRS2(rs2);

        let imm4_0 = IR.slice(20, 25);
        let imm11_5 = IR.slice(0, 7);
        let imm = imm11_5 + imm4_0;
        
    }
    else if(type == 'SB'){
        let rs1 = IR.slice(12, 17);
        regFile.setRS1(rs1);

        let rs2 = IR.slice(7 ,12)
        regFile.setRS2(rs2);

        let imm = IR.slice(0) + IR.slice(25) + IR.slice(1, 7) + IR.slice(20, 24);

    }
    else if(type == 'U'){
        let rd = IR.slice(20, 25);
        regFile.setRD(rd);

        let imm31_12 = IR.slice(0, 20);
    }
    else if(type == 'UJ'){
        let rd = IR.slice(20, 25);
        regFile.setRD(rd);

        let imm = IR.slice(0) + IR.slice(1, 9) + IR.slice(9) + IR.slice(10, 20);

    }
    else{
        console.error('Not a valid instruction!(invalid Opcode)');
    }
}


interface generateIAPayloadInterface { selectLineINC0, imm, selectLinePC0, returnAddress };

// Function updates Program Counter
function generateInstructionAddress(generateIAPayload: generateIAPayloadInterface) {
    let selectLineINC0 = generateIAPayload.selectLineINC0;
    let imm = generateIAPayload.imm;
    let selectLinePC0 = generateIAPayload.selectLinePC0;
    let returnAddress = generateIAPayload.returnAddress;
    // if selectLinePC0 = 1 then new pc = returnAddress
    if (selectLinePC0) {
        PC = returnAddress;
    } else {
        // if selectLineINC0 = 1 then new pc = pc + imm
        if (selectLineINC0) {
            PC = PC + imm;
        } else {
            PC = PC + 4;
        }
    }
}
