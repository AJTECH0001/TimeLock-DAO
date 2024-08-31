# Timelock Contract DAO for Cardano Blockchain

## Overview

### This repository contains the Plutus script for a time-locked transaction contract designed for use on the Cardano blockchain. The contract provides a robust mechanism for queuing, executing, and canceling transactions after a specified delay, with built-in access control and error handling. This smart contract is particularly useful in scenarios where delayed execution of transactions is necessary, such as DAO governance, escrow services, and automated blockchain tasks.

## Key Features
```Queueing Transactions```: Allows authorized users to queue transactions with a specified delay.

```Executing Transactions```: Enables the execution of queued transactions after the delay period has passed.

```Cancelling Transactions```: Provides a mechanism for canceling queued transactions before they are executed.

```Access Control```: Ensures that only authorized users can queue, execute, or cancel transactions.

```Error Handling```: Implements comprehensive error handling for scenarios such as invalid timestamps, transaction not found, and unauthorized access.

## Dependencies
To work with this contract, the following dependency is required:

```@harmoniclabs/plu-ts```: A TypeScript library for writing Plutus smart contracts.

## Installation

## Clone the Repository:

### git clone https://github.com/AJTECH0001/TimeLock-DAO.git

### cd TimeLock-DAO

## Install Dependencies:

Run the following command in your project directory:

```npm install @harmoniclabs/plu-ts```

## Contract Functionality
### Constants

```MIN_DELAY```: The minimum delay (in seconds) before a transaction can be executed (set to 10 seconds).

```MAX_DELAY```: The maximum delay (in seconds) before a transaction must be executed (set to 1000 seconds).

```GRACE_PERIOD```: The period (in seconds) after the delay during which a transaction can still be executed (set to 1000 seconds).

### Data Types

```TxData```: A tuple representing transaction data, including the public key hash of the recipient, a byte string, a string for the function name, a byte string for the function parameters, and the scheduled execution timestamp.

```TxId```: A byte string representing the unique identifier for a transaction.

```ContractState```: A mapping from TxId to a tuple containing TxData and a timestamp.

## Main Functions

### Queueing Transactions:

The contract allows an authorized user to queue a transaction with a specified delay. The transaction is stored in the contract state with a unique TxId and is scheduled for execution at the specified timestamp.

```const queueTransaction = (target: PPubKeyHash, value: PInt, func: pString, data: bs, timestamp: PInt) => {
  const txId = getTxId(target, value, func, data, timestamp);
  state.update(txId, () => PMaybe.Just([target, value, func, data, timestamp]));
};```

### Executing Transactions:

Once the delay period has passed and the timestamp is within the grace period, the transaction can be executed. The contract verifies that the transaction is executable and calls the target contract with the specified parameters.

```const executeTx = (txId: TxId, state: typeof ContractState, ctx: PScriptContext) => {
  // Execution logic
};```

Cancelling Transactions:

The contract also allows the owner to cancel a queued transaction, removing it from the contract state before it is executed.

```const cancelTx = (txId: TxId, state: typeof ContractState) => {
  state.update(txId, () => PMaybe.Nothing());
};```

Access Control

The contract ensures that only the owner (or authorized users) can perform actions such as queueing, executing, or canceling transactions. This is enforced using the isOwner function which checks the transaction signatories against the owner's public key hash.

```const isOwner = ctx.txInfo.signatories.some(owner.eqTerm);```

Error Handling

The contract includes comprehensive error handling to manage various scenarios:

Invalid Timestamp: Ensures that the timestamp for transaction execution falls within the allowed delay range.

Transaction Not Found: Handles cases where the transaction ID does not exist in the contract state.

Unauthorized Access: Ensures only the owner can perform specific contract operations.

Example Contract Usage

Here is an example of how the contract might be used:

Queue a Transaction:

An authorized user queues a transaction with a delay of 500 seconds.

```queueTransaction(owner, value, "transfer", params, timestamp.add(500));```

Execute a Transaction:

After 500 seconds (plus the grace period), the transaction is executed.

```executeTx(txId, contractState, ctx);```

Cancel a Transaction:

Before the delay period is over, the owner cancels the transaction.

```cancelTx(txId, contractState);```

Potential Use Cases

```DAO Governance```: Time-locked proposals for DAO decisions, ensuring that changes to the DAO are deliberated upon before execution.

```Escrow Services```: Holding funds in escrow until specific conditions are met, with a built-in delay for any disputes or adjustments.

```Automated Tasks```: Scheduling recurring tasks on the blockchain, such as periodic fund transfers or contract upgrades.

Future Improvements

Security Audits: Conduct thorough security audits to identify and address potential vulnerabilities in the contract.

Gas Optimization: Optimize the contract for gas efficiency to reduce transaction costs on the Cardano blockchain.

Additional Features: Explore adding features like multi-signature approvals, more complex transaction conditions, or variable delay periods based on contract state or external conditions.
