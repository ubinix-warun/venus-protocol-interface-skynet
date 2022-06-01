import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { noop } from 'lodash';
import { ALL_VALUE } from './Filters';
import { HistoryUi } from '.';

export default {
  title: 'Pages/History',
  component: HistoryUi,
  parameters: {
    backgrounds: {
      default: 'White',
    },
  },
} as ComponentMeta<typeof HistoryUi>;

export const Default = () => (
  <HistoryUi
    eventType={ALL_VALUE}
    setEventType={noop}
    showOnlyMyTxns={false}
    setShowOnlyMyTxns={noop}
    transactions={[]}
  />
);
