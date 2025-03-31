import {EnhancedEvent, SourceEvent} from "./types";

export function enhanceEvent(event: SourceEvent): EnhancedEvent {
    return {
        ...event,
        brand: 'testBrand'
    };
}