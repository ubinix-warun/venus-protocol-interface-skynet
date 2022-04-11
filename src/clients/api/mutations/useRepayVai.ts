import { MutationObserverOptions, useMutation } from 'react-query';

import { repayVai, IRepayVaiInput, IRepayVaiOutput } from 'clients/api';
import FunctionKey from 'constants/functionKey';
import { useVaiUnitroller } from 'hooks/useContract';

type Options = MutationObserverOptions<
  IRepayVaiOutput,
  Error,
  Omit<IRepayVaiInput, 'vaiControllerContract'>
>;

const useRepayVai = (options?: Options) => {
  const vaiControllerContract = useVaiUnitroller();

  // @TODO: invalidate queries related to fetching the user VAI balance and
  // minted VAI amount on success
  return useMutation(
    FunctionKey.REPAY_VAI,
    (params: Omit<IRepayVaiInput, 'vaiControllerContract'>) =>
      repayVai({
        vaiControllerContract,
        ...params,
      }),
    options,
  );
};

export default useRepayVai;