import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test storing new image",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('vault-snap', 'store-image', [
        types.ascii("QmHash123"),
        types.ascii("Test Image"),
        types.ascii("image/jpeg")
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1);
    
    const response = chain.callReadOnlyFn(
      'vault-snap',
      'get-image-info',
      [types.uint(1)],
      deployer.address
    );
    
    response.result.expectOk().expectTuple();
  }
});

Clarinet.test({
  name: "Test image ownership transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // First store an image
    let block = chain.mineBlock([
      Tx.contractCall('vault-snap', 'store-image', [
        types.ascii("QmHash123"),
        types.ascii("Test Image"),
        types.ascii("image/jpeg")
      ], deployer.address)
    ]);
    
    // Then transfer it
    block = chain.mineBlock([
      Tx.contractCall('vault-snap', 'transfer-image', [
        types.uint(1),
        types.principal(wallet1.address)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Verify ownership
    const response = chain.callReadOnlyFn(
      'vault-snap',
      'owns-image',
      [types.principal(wallet1.address), types.uint(1)],
      deployer.address
    );
    
    response.result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "Test unauthorized transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Store image as deployer
    let block = chain.mineBlock([
      Tx.contractCall('vault-snap', 'store-image', [
        types.ascii("QmHash123"),
        types.ascii("Test Image"),
        types.ascii("image/jpeg")
      ], deployer.address)
    ]);
    
    // Try to transfer as non-owner
    block = chain.mineBlock([
      Tx.contractCall('vault-snap', 'transfer-image', [
        types.uint(1),
        types.principal(wallet2.address)
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(102); // err-unauthorized
  }
});
