/* contracts/Swap.sol */

// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

contract SimpleSwap {
    ISwapRouter public immutable swapRouter;
    address public constant ONE = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant ETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    uint24 public constant feeTier = 3000;

		constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;
    }

    function swapETHForONE(uint amountIn) external returns (uint256 amountOut) {
    // Transfer the specified amount of ETH to this contract.
    TransferHelper.safeTransferFrom(WETH9, msg.sender, address(this), amountIn);

		// Approve the router to spend ETH.
    TransferHelper.safeApprove(ETH, address(swapRouter), amountIn);

    ISwapRouter.ExactInputSingleParams memory params =
      ISwapRouter.ExactInputSingleParams({
          tokenIn: ETH,
          tokenOut: ONE,
          fee: feeTier,
          recipient: msg.sender,
          deadline: block.timestamp,
          amountIn: amountIn,
          amountOutMinimum: 0,
          sqrtPriceLimitX96: 0
      });
    // The call to `exactInputSingle` executes the swap.
    amountOut = swapRouter.exactInputSingle(params);
    return amountOut;
}
}