export class MemoryFile{
    private memory : Map<number, number>;
    private UpAddr : number;
    constructor(){
        this.memory = new Map<number, number>();
    }

    MEM_READ(addr: number, dtype: string): number{
        let temp: string = "";
        let len :number;
        if(dtype == 'b'){len = 1;}
        else if(dtype == 'h'){len = 2;}
        else if(dtype == 'w'){len = 4;}
        else if(dtype == 'd'){len = 8;}
        let temp1, val;
        for(let i=0;i<len;i++){
            val = this.memory.get(addr+i);
            if(this.memory.get(addr+i)>=0){
                temp1 = addZeros((val).toString(2), 8);
            }
            else{
                temp1 = ( val >>> 0).toString(2).slice(val.length-8, val.length);
            }
            temp = temp1+ temp;
            console.log((this.memory.get(addr+i).toString(2)));
        }
        console.log(temp);
        return parseInt(addOnesZeros(temp), 2)>>0;
    }

    MEM_WRITE(addr: number, value:number, dtype:string){
        let len : number;
        if(dtype == 'b'){len = 1;}
        else if(dtype == 'h'){len = 2;}
        else if(dtype == 'w'){len = 4;}
        else if(dtype == 'd'){len = 8;}
        let valString : string, tempStr : string;
        if(value>=0){
            valString = addZeros(value.toString(2), 8*len);
        }
        else{
            valString = (value >>> 0).toString(2);
        }
        // console.log(valString);
        for(let i=0;i<len;i++){
            tempStr = valString.slice((len-i-1)*8+1, (len-i)*8);
            this.memory.set((addr + i), parseInt(tempStr, 2));
        }
        console.table(this.memory);
    }
}

// padding of zeros or ones to end up with a 32 bit value
export function addOnesZeros(value: string, len?:number) :string {
    let pad:string;
    if(!len){
        len = 32
    }
    if(value[0]=='1'){
        pad = "1".repeat(32-value.length);
    }
    else{
        pad = "0".repeat(32-value.length);
    }
    return pad+value;
}

export function addZeros(imm:string, length: number):string{
    let n = length - imm.length;
    let immPad = "0".repeat(n);
    return immPad + imm;
}
