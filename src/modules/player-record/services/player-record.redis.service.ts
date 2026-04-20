import { Injectable } from "@nestjs/common";

@Injectable()
export class PlayerRecordRedisService{
    
    async savePlayerRecord(){
        const key = ``
    }

    async playerList(pin: string){
        const key = `game:room:${pin}:players`;

        
    }
}