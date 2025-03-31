export interface SourceEvent {
    id: string;
    name: string;
    body: string;
    timestamp: string;
}

export interface EnhancedEvent extends SourceEvent {
    brand: string;
}