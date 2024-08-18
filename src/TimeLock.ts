import {
  bool,
  compile,
  pfn,
  Script,
  ScriptType,
  PScriptContext,
  bs,
  PPubKeyHash,
  pString,
  Data,
  PMaybe,
  Methods,
  PAlias,
  PByteString,
  PInt,
  pTuple,
  pMap,
  pUnit,
  PBool,
  pFalse,
  pTrue,
} from "@harmoniclabs/plu-ts";

// Constants
const MIN_DELAY = PInt(10); // seconds
const MAX_DELAY = PInt(1000); // seconds
const GRACE_PERIOD = PInt(1000); // seconds

// Define data types for transactions
const TxData = pTuple([PPubKeyHash, bs, pString, bs, PInt]);
type TxId = PByteString;

// Contract state (mapping TxId -> (TxData, timestamp))
const ContractState = pMap(TxId, pTuple([TxData, PInt]));

// Helper function to check if a timestamp is within the allowed range
const isTimestampInRange = (timestamp: PInt, ctx: PScriptContext): PBool => {
  const currentTimestamp = ctx.txInfo.validRange.start; // Assuming block time is in validRange start
  return timestamp.gte(currentTimestamp.add(MIN_DELAY)).and(
      timestamp.lte(currentTimestamp.add(MAX_DELAY))
  );
};

// Helper function to check if a transaction is queued
const isQueued = (txId: TxId, state: typeof ContractState): PBool => {
  return state.lookup(txId).isJust();
};

// Helper function to get the transaction data from the state
const getTxData = (txId: TxId, state: typeof ContractState) => {
  return state.lookup(txId).withDefault(() => PMaybe.Nothing(TxData));
};

// Helper function to check if a transaction is executable
const isExecutable = (txId: TxId, state: typeof ContractState, ctx: PScriptContext): PBool => {
  const txDataMaybe = getTxData(txId, state);
  return txDataMaybe.matchWith({
      Just: (txData) => {
          const [_, _, _, _, timestamp] = txData.value;
          const currentTimestamp = ctx.txInfo.validRange.start;
          return timestamp.lte(currentTimestamp.add(GRACE_PERIOD));
      },
      Nothing: () => pFalse,
  });
};

// Helper function to execute a transaction
const executeTx = (txId: TxId, state: typeof ContractState, ctx: PScriptContext) => {
  const txDataMaybe = getTxData(txId, state);
  return txDataMaybe.matchWith({
      Just: (txData) => {
          const [target, value, func, data, timestamp] = txData.value;
          // Implement logic to call the target contract with the given parameters
          // ...
          return pUnit; // Return unit after successful execution
      },
      Nothing: () => pFalse, // Handle case where transaction not found
  });
};

// Main contract logic
const contract = pfn([PPubKeyHash, bs, PScriptContext], bool)((owner, message, ctx) => {
  const isOwner = ctx.txInfo.signatories.some(owner.eqTerm);

  const action = message.decode(pTuple([PInt, bs])); // Decode message into action type and data

  const state = ctx.txInfo.data.lookup("state").withDefault(() => ContractState.empty());

  switch (action.fst) {
      case PInt(0): // Queue transaction
          const [target, value, func, data, timestamp] = action.snd.decode(TxData);
          const txId = getTxId(target, value, func, data, timestamp); // Implement getTxId logic
          return isOwner.and(isTimestampInRange(timestamp, ctx)).and(
              state.update(txId, () => PMaybe.Just([target, value, func, data, timestamp]))
          );
      case PInt(1): // Execute transaction
          const txIdExec = action.snd;
          return isOwner.and(isExecutable(txIdExec, state, ctx)).and(executeTx(txIdExec, state, ctx));
      case PInt(2): // Cancel transaction
          const txIdCancel = action.snd;
          return isOwner.and(isQueued(txIdCancel, state)).and(
              state.update(txIdCancel, () => PMaybe.Nothing())
          );
      default:
          return pFalse; // Invalid action
  }
});

// All validators must be untyped once on-chain
export const untypedValidator = contract.toUntyped();

// Here we get the raw bytes of the contract
export const compiledContract = compile(untypedValidator);

// The `script` object can be used off-chain
export const script = new Script(
  ScriptType.PlutusV2,
  compiledContract
);
