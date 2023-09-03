import { hasOwn } from "@harmoniclabs/obj-utils";
import { CanBeUInteger, canBeUInteger } from "../utils/ints";


export interface GenesisInfos {
    /**
     * ### POSIX timestamp of blockchain start
     * ## with **milliseconds precision**
    **/
    readonly systemStartPOSIX: CanBeUInteger,
    /**
     * ### slot duration in **milliseconds**
    **/
    readonly slotLengthInMilliseconds: CanBeUInteger
}

export function isGenesisInfos( stuff: any ): stuff is GenesisInfos
{
    return (
        typeof stuff === "object" && stuff !== null &&
        hasOwn( stuff, "systemStartPOSIX" ) && 
        canBeUInteger( stuff.systemStartPOSIX ) &&
        hasOwn( stuff, "slotLengthInMilliseconds" ) &&
        canBeUInteger( stuff.slotLengthInMilliseconds )
    );
}