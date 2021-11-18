import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'antd';
import { compose } from 'recompose';
import { connectAccount } from 'core';
import BigNumber from 'bignumber.js';
import commaNumber from 'comma-number';
import { Card } from 'components/Basic/Card';
import NumberFormat from 'react-number-format';
import Button from '@material-ui/core/Button';
import * as constants from 'utilities/constants';
import xvsImg from 'assets/img/venus_32.png';
import { useWeb3React } from '@web3-react/core';
import { useToken, useVault } from '../../../hooks/useContract';
import { getVaultAddress } from '../../../utilities/addressHelpers';

const StakingWrapper = styled.div`
  width: 100%;
  border-radius: 25px;
  background-color: var(--color-bg-primary);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;

  .stake-section {
    margin: 15px 0;
    padding: 30px 0;
    border-radius: 20px;
    background-color: var(--color-bg-main);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;

    .stake-info {
      font-weight: 500;
      font-size: 18px;
      color: var(--color-white);
    }

    .stake-warning {
      margin-top: 43px;
      font-size: 15px;
      color: var(--color-text-secondary);
    }

    .stake-input {
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      margin-top: 15px;

      input {
        width: 65%;
        margin-left: 17.5%;
        border: none;
        height: 100%;
        font-size: 40px;
        color: var(--color-yellow);
        text-align: center;
        background: transparent;
        &:focus {
          outline: none;
        }
      }

      span {
        position: absolute;
        right: 25px;
        width: 12%;
        text-align: center;
        font-weight: 600;
        font-size: 14px;
        color: #bdbdbd;
        cursor: pointer;
      }
    }

    .pending-info {
      margin-top: 25px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .pending-label {
        color: var(--color-text-main);
        font-size: 24px;
        margin-top: 20px;
      }

      .pending-amount {
        color: var(--color-text-secondary);
        font-size: 20px;
        margin: 5px 0;
      }
    }

    .button {
      width: 248px;
      height: 41px;
      border-radius: 5px;
      background-image: linear-gradient(to right, #f2c265, #f7b44f);
      margin-top: 15px;

      .MuiButton-label {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-main);
        text-transform: capitalize;
      }
    }

    .prop {
      font-weight: 600;
      font-size: 20px;
      color: var(--color-text-secondary);
    }

    .value {
      font-weight: 600;
      font-size: 24px;
      color: var(--color-white);
      margin-top: 15px;

      img {
        width: 24px;
        margin-right: 10px;
      }

      .claim-btn {
        font-size: 18px;
        font-weight: bold;
        color: var(--color-orange);
        margin-left: 30px;
      }
      .disable-btn {
        color: var(--color-text-secondary);
      }
    }
  }
`;

const format = commaNumber.bindWith(',', '.');

function Staking({ settings, userInfo, rewardAddress }) {
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [isStakeLoading, setIsStakeLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(new BigNumber(0));
  const [withdrawAmount, setWithdrawAmount] = useState(new BigNumber(0));
  const { account } = useWeb3React();
  const vaultContract = useVault();
  const xvsContract = useToken('xvs');

  const {
    walletBalance,
    stakedAmount,
    enabled,
    pendingReward,
    withdrawableAmount,
    requestedAmount
  } = userInfo;

  /**
   * Stake
   */
  const handleStake = async () => {
    setIsStakeLoading(true);
    try {
      await vaultContract.methods
        .deposit(
          rewardAddress,
          0,
          stakeAmount
            .times(1e18)
            .integerValue()
            .toString(10)
        )
        .send({ from: account });
      setStakeAmount(new BigNumber(0));
    } catch (error) {
      console.log('stake error :>> ', error);
    }
    setIsStakeLoading(false);
  };

  /**
   * Request Withdrawal
   */
  const handleRequestWithdrawal = async () => {
    setIsWithdrawLoading(true);
    try {
      await vaultContract.methods
        .RequestWithdrawal(
          rewardAddress,
          0,
          withdrawAmount
            .times(1e18)
            .integerValue()
            .toString(10)
        )
        .send({ from: account });
      setWithdrawAmount(new BigNumber(0));
    } catch (error) {
      console.log('request withdrawal error :>> ', error);
    }
    setIsWithdrawLoading(false);
  };

  /**
   * Execute Withdrawal
   */
  const handleExecuteWithdrawal = async () => {
    setIsWithdrawLoading(true);
    try {
      await vaultContract.methods
        .ExecuteWithdrawal(rewardAddress, 0)
        .send({ from: account });
      setWithdrawAmount(new BigNumber(0));
    } catch (error) {
      console.log('execute withdrawal error :>> ', error);
    }
    setIsWithdrawLoading(false);
  };

  const onApprove = async () => {
    setIsStakeLoading(true);
    try {
      await xvsContract.methods
        .approve(
          getVaultAddress(),
          new BigNumber(2)
            .pow(256)
            .minus(1)
            .toString(10)
        )
        .send({ from: account });
    } catch (error) {
      console.log('xvs approve error :>> ', error);
    }
    setIsStakeLoading(false);
  };

  const handleClaimReward = async () => {
    if (isClaimLoading || pendingReward.isZero()) return;
    setIsClaimLoading(true);
    try {
      await vaultContract.methods
        .deposit(rewardAddress, 0, 0)
        .send({ from: account });
    } catch (error) {
      console.log('claim reward error :>> ', error);
    }
    setIsClaimLoading(false);
  };

  return (
    <Card>
      <StakingWrapper>
        <div className="stake-section">
          <div className="stake-info">
            Available XVS to stake: {format(walletBalance.toFormat(2))} XVS
          </div>
          {!enabled ? (
            <p className="stake-warning">
              To stake XVS, you need to approve it first.
            </p>
          ) : (
            <div className="stake-input">
              <NumberFormat
                autoFocus
                value={stakeAmount.isZero() ? '' : stakeAmount.toString(10)}
                onValueChange={({ value }) => {
                  setStakeAmount(new BigNumber(value));
                }}
                isAllowed={({ value }) => {
                  return new BigNumber(value || 0).lte(walletBalance);
                }}
                thousandSeparator
                allowNegative={false}
                placeholder="0"
              />
              <span onClick={() => setStakeAmount(walletBalance)}>MAX</span>
            </div>
          )}
          {!enabled ? (
            <Button
              className="button"
              disabled={isStakeLoading || !account}
              onClick={() => {
                onApprove();
              }}
            >
              {isStakeLoading && <Icon type="loading" />} Enable
            </Button>
          ) : (
            <Button
              className="button"
              disabled={
                !account ||
                isStakeLoading ||
                stakeAmount.isZero() ||
                stakeAmount.isNaN() ||
                stakeAmount.isGreaterThan(walletBalance)
              }
              onClick={handleStake}
            >
              {isStakeLoading && <Icon type="loading" />} Stake
            </Button>
          )}
        </div>
        <div className="stake-section">
          <div className="stake-info">
            XVS staked: {format(stakedAmount.dp(4, 1).toString(10))} XVS
          </div>
          {!withdrawableAmount.isZero() ? (
            <div className="pending-info">
              <div className="pending-amount">
                Withdrawable Amount: {requestedAmount.toFormat(2)} XVS
              </div>
              <Button
                className="button"
                onClick={() => handleExecuteWithdrawal()}
                disabled={isWithdrawLoading || !account}
              >
                {isWithdrawLoading && <Icon type="loading" />} Execute
                Withdrawal
              </Button>
            </div>
          ) : requestedAmount.isZero() ? (
            <>
              <div className="stake-input">
                <NumberFormat
                  autoFocus
                  value={
                    withdrawAmount.isZero() ? '' : withdrawAmount.toString(10)
                  }
                  onValueChange={({ value }) => {
                    setWithdrawAmount(new BigNumber(value));
                  }}
                  isAllowed={({ value }) => {
                    return new BigNumber(value || 0).lte(stakedAmount);
                  }}
                  thousandSeparator
                  allowNegative={false}
                  placeholder="0"
                />
                <span onClick={() => setWithdrawAmount(stakedAmount)}>MAX</span>
              </div>
              <Button
                className="button"
                onClick={() => handleRequestWithdrawal()}
                disabled={
                  !account ||
                  isWithdrawLoading ||
                  withdrawAmount.isZero() ||
                  withdrawAmount.isNaN() ||
                  withdrawAmount.isGreaterThan(stakedAmount)
                }
              >
                {isWithdrawLoading && <Icon type="loading" />} Request
                Withdrawal
              </Button>
            </>
          ) : (
            <div className="pending-info">
              <div className="pending-amount">Withdrawal Pending</div>
              <div className="pending-label">
                {requestedAmount.toFormat(2)} XVS
              </div>
            </div>
          )}
        </div>
        <div className="stake-section">
          <div className="stake-info">Available XVS rewards:</div>
          <div className="flex align-center just-between value">
            <p>
              <img src={xvsImg} alt="xvs" />
              <span>{format(pendingReward.toFormat(2))} XVS</span>
            </p>
            <p
              className={`pointer claim-btn ${
                isClaimLoading || pendingReward.isZero() ? 'disable-btn' : ''
              }`}
              onClick={handleClaimReward}
            >
              {isClaimLoading && <Icon type="loading" />} Claim
            </p>
          </div>
        </div>
        <div className="stake-section">
          <div className="stake-info">Venus Balance:</div>
          <div className="flex align-center just-between value">
            <img src={xvsImg} alt="xvs" />
            <span>{format(walletBalance.toFormat(2))} XVS</span>
          </div>
        </div>
      </StakingWrapper>
    </Card>
  );
}

Staking.propTypes = {
  settings: PropTypes.object,
  userInfo: PropTypes.object.isRequired,
  rewardAddress: PropTypes.string.isRequired
};

Staking.defaultProps = {
  settings: {}
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting
});

export default compose(connectAccount(mapStateToProps, undefined))(Staking);
