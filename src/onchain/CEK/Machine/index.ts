import BasePlutsError from "../../../errors/BasePlutsError";
import PlutsCEKError from "../../../errors/PlutsCEKError";
import PlutsCEKUnboundVarError from "../../../errors/PlutsCEKError/PlutsCEKComputeError/PlutsCEKUnboundVarError";
import { AnyV1CostModel, AnyV2CostModel, costModelV1ToFakeV2, defaultV2Costs, isCostModelsV1, isCostModelsV2, toCostModelV2 } from "../../../offchain/ledger/CostModels";
import ObjectUtils from "../../../utils/ObjectUtils";
import UPLCTerm, { PureUPLCTerm } from "../../UPLC/UPLCTerm";
import Application from "../../UPLC/UPLCTerms/Application";
import Builtin from "../../UPLC/UPLCTerms/Builtin";
import UPLCBuiltinTag from "../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";
import Delay from "../../UPLC/UPLCTerms/Delay";
import ErrorUPLC from "../../UPLC/UPLCTerms/ErrorUPLC";
import Force from "../../UPLC/UPLCTerms/Force";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import Lambda from "../../UPLC/UPLCTerms/Lambda";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import UPLCVar from "../../UPLC/UPLCTerms/UPLCVar";
import { PlutusScriptVersion } from "../../pluts/Script";
import Term from "../../pluts/Term";
import BnCEK from "../BnCEK";
import PartialBuiltin from "../BnCEK/PartialBuiltin";
import CEKEnv from "../CEKEnv";
import CEKFrames from "../CEKFrames";
import ForceFrame from "../CEKFrames/ForceFrame";
import LApp from "../CEKFrames/LApp";
import RApp from "../CEKFrames/RApp";
import CEKHeap from "../CEKHeap";
import CEKSteps, { ComputeStep, ReturnStep } from "../CEKSteps";
import DelayCEK from "../DelayCEK";
import LambdaCEK from "../LambdaCEK";
import { BuiltinCostsOf, costModelV2ToBuiltinCosts } from "./BuiltinCosts";
import ExBudget from "./ExBudget";
import type { MachineCosts } from "./MachineCosts";
import costModelV2ToMachineCosts from "./MachineCosts";

/**
 * @todo
 * TODO: to substitute when modifying offchain
**/
type MachineVersion = PlutusScriptVersion.V1 | PlutusScriptVersion.V2

function isMachineVersion( something: any ): something is MachineVersion
{
    return something === PlutusScriptVersion.V1 || something === PlutusScriptVersion.V2;
}

type CostModelOf<V extends MachineVersion> =
    V extends PlutusScriptVersion.V1 ? AnyV1CostModel :    
    V extends PlutusScriptVersion.V2 ? AnyV2CostModel :
    never    

export default class Machine<V extends MachineVersion>
{
    readonly version!: V;

    constructor(
        version: V,
        costmodel: CostModelOf<V>
    )
    {
        if( !isMachineVersion( version ) ) throw new BasePlutsError("invalid MachineVersion");
        ObjectUtils.defineReadOnlyProperty( this, "version", version );

        const isV1 = isCostModelsV1( costmodel );
        if( !isV1 && !isCostModelsV2( costmodel ) ) throw new BasePlutsError("invalid machine costs");
        
        const costs = isV1 ? costModelV1ToFakeV2( costmodel ) : toCostModelV2( costmodel );
        ObjectUtils.defineReadOnlyHiddenProperty( this, "getBuiltinCostFuction", costModelV2ToBuiltinCosts( costs ) );
        ObjectUtils.defineReadOnlyHiddenProperty( this, "machineCosts", costModelV2ToMachineCosts( costs ) );
    }

    static evalSimple( _term: UPLCTerm | Term<any> ): PureUPLCTerm
    {
        return (
            new Machine(
                PlutusScriptVersion.V2,
                defaultV2Costs
            )
        ).eval( _term ).result;
    }

    eval( _term: UPLCTerm | Term<any> ): { result: PureUPLCTerm, budgetSpent: ExBudget, logs: string[] }
    {
        const budget = new ExBudget({ mem: 0, cpu: 0 });
        const spend = budget.add;

        const logs: string[] = [];

        const machineCosts: MachineCosts = (this as any).machineCosts;
        const getBuiltinCostFuction: <Tag extends UPLCBuiltinTag>( tag: Tag ) => BuiltinCostsOf<Tag> = (this as any).getBuiltinCostFuction;

        const bnCEK = new BnCEK( getBuiltinCostFuction, budget, logs );
        
        const frames = new CEKFrames();
        const steps = new CEKSteps();
        const heap = new CEKHeap();
    
        spend( machineCosts.startup );
        compute( _term instanceof Term ? _term.toUPLC(0) : _term, new CEKEnv( heap ) );
    
        while( !frames.isEmpty || steps.topIsCompute )
        {
            const nextStep = steps.pop();
    
            if( nextStep === undefined )
            {
                throw new PlutsCEKError("step stack was empty; don't know how to proceed");
            }
            if( nextStep instanceof ComputeStep )
            {
                compute( nextStep.term, nextStep.env );
            }
            else if( nextStep instanceof ReturnStep )
            {
                returnCEK( nextStep.value );
            }
            else throw new PlutsCEKError( "unknown step" );
        }
    
        function compute( term: UPLCTerm, env: CEKEnv ): void
        {
            // n_compute++;
    
            if( term instanceof HoistedUPLC )
            {
                // HoistedUPLC are always closed; do not need external variables
                steps.push( new ComputeStep( term.UPLC, new CEKEnv( heap ) ) );
                return;
            }
            if( term instanceof ErrorUPLC )
            {
                steps.push( new ReturnStep( term ) );
                return;
            }
    
            if( term instanceof UPLCVar )
            {
                const varValue = env.get( term.deBruijn );
                if( varValue === undefined ) throw new PlutsCEKUnboundVarError();
                steps.push( new ReturnStep( varValue ) );
                return;
            }
    
            if( term instanceof UPLCConst )
            {
                steps.push( new ReturnStep( term ) );
                return;
            }
    
            if( term instanceof Lambda )
            {
                steps.push(
                    new ReturnStep(
                        new LambdaCEK( term.body, env.clone() )
                    )
                );
    
                return;
            }
    
            if( term instanceof Delay )
            {
                steps.push(
                    new ReturnStep(
                        new DelayCEK(
                            term.delayedTerm,
                            env
                        )
                    )
                );
                return;
            }
    
            if( term instanceof Force )
            {
                frames.push( new ForceFrame );
                steps.push( new ComputeStep( term.termToForce, env ) );
                return;
            }
    
            if( term instanceof Application )
            {
                frames.push( new RApp( term.argTerm, env ) );
                steps.push( new ComputeStep( term.funcTerm, env ) );
                return;
            }
    
            if(
                term instanceof Builtin ||
                (term as any) instanceof PartialBuiltin
            )
            {
                steps.push(
                    new ReturnStep(
                        term instanceof PartialBuiltin? term : new PartialBuiltin( term.tag )
                    )
                );
                return;
            }
    
            steps.push( new ReturnStep( new ErrorUPLC("ComputeStep/no match", { term } ) ) )
            return;
        }
    
        function returnCEK( v: UPLCTerm ): void
        {
            // n_returns++;
    
            if( v instanceof HoistedUPLC )
            {
                steps.push( new ComputeStep( v.UPLC, new CEKEnv( heap ) ) );
                return;
            }
    
            if( v instanceof PartialBuiltin )
            {
                if( v.nMissingArgs === 0 )
                {
                    steps.push( new ReturnStep( bnCEK.eval( v ) ) );
                    return;
                }
                if( frames.isEmpty )
                {
                    steps.push( new ReturnStep( new ErrorUPLC("ReturnStep/PartialBuiltin/empty frames") ) );
                    return;
                }
            }
    
            if( frames.isEmpty )
            {
                // ends while loop
                steps.push( new ReturnStep( v ) );
                return;    
            }
    
            const topFrame = frames.pop();
    
            if( v instanceof ErrorUPLC )
            {
                steps.push( new ReturnStep( v ) );
                return;
            }
    
            if( topFrame instanceof ForceFrame )
            {
                if(
                    v instanceof Delay      ||
                    v instanceof DelayCEK
                )
                {
                    steps.push(
                        new ComputeStep(
                            v.delayedTerm,
                            v instanceof DelayCEK ? v.env : new CEKEnv( heap )
                        )
                    );
                    return;
                }
    
                // not sure about the env...
                steps.push(
                    new ComputeStep(
                        v,
                        new CEKEnv( heap )
                    )
                );
                return;
            }
            // builtin forces are added only at compile time
            // ence not present in plu-ts UPLCTerm
    
            if( topFrame instanceof RApp )
            {
                frames.push( new LApp( v ) );
                steps.push( new ComputeStep( topFrame.arg, topFrame.env ) );
                return;
            }
    
            if( topFrame instanceof LApp )
            {
                if(
                    topFrame.func instanceof Lambda     ||
                    topFrame.func instanceof LambdaCEK
                )
                {
                    const _env = topFrame.func instanceof LambdaCEK ?
                        topFrame.func.env :
                        new CEKEnv( heap );
    
                    _env.push( v );
    
                    steps.push(
                        new ComputeStep(
                            topFrame.func.body,
                            _env
                        )
                    );
                    return;
                }
                
                if(
                    topFrame.func instanceof Builtin || 
                    topFrame.func instanceof PartialBuiltin 
                )
                {
                    let bn = topFrame.func.clone();
                    if( bn instanceof Builtin )
                    {
                        bn = new PartialBuiltin( bn.tag );
                    }
    
                    if( bn.nMissingArgs === 0 ) return returnCEK( bnCEK.eval( bn ) );
    
                    bn.apply( v )
    
                    // choose what to do based on the frames
                    return returnCEK( bn );
                }
            }
    
            steps.push( new ReturnStep( new ErrorUPLC("ReturnStep/LApp", { topFrame: topFrame } ) ) )
            return;
        }
    
        // Debug.timeEnd(timeTag);
    
        // console.log( n_compute, n_returns );
        return {
            result: (steps.pop() as ReturnStep).value ?? new ErrorUPLC("steps.pop() was not a ReturnStep"),
            budgetSpent: budget,
            logs: logs
        };
    }

}