export enum GameSessionStatus {
    LOBBY = 'LOBBY',
    STARTING = 'STARTING',
    ENDED = 'ENDED'
}

export const GameState: GameSessionStatus[] = [
    GameSessionStatus.LOBBY,
    GameSessionStatus.STARTING,
    GameSessionStatus.ENDED
]