import JsRuntime from "../../utils/JsRuntime";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborNegativeInt = {
    negative: bigint
}

export function isRawCborNegative( neg: RawCborNegativeInt ): boolean
{
    if( typeof neg !== "object" ) return false;
    
    const keys = Object.keys( neg );

    return (
        keys.length === 1 &&
        keys[0] === "negative"  &&
        typeof neg.negative === "bigint"
    );
}

export default class CborNegativeInt
    implements ToRawObj
{
    private _neg : bigint;
    get num(): bigint { return this._neg }
    
    constructor( negative: number | bigint )
    {
        if( typeof negative === "number" )
        {
            negative = BigInt( negative );
        }

        JsRuntime.assert(
            typeof negative === "bigint" &&
            negative < BigInt( 0 ),
            "negative CBOR numbers must be less than 0; got: " + negative
        );

        this._neg = negative;
    }

    toRawObj(): RawCborNegativeInt
    {
        return {
            negative: this.num
        };
    }
}