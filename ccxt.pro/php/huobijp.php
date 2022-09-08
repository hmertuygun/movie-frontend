<?php

namespace ccxtpro;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\NotSupported;

class huobijp extends huobi {

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'id' => 'huobijp',
            'name' => 'Huobi Japan',
            'countries' => array( 'JP' ),
            'hostname' => 'api-cloud.huobi.co.jp',
            'has' => array(
                'fetchDepositAddress' => false,
            ),
            'urls' => array(
                'logo' => 'https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg',
                'api' => array(
                    'ws' => array(
                        'api' => array(
                            'public' => 'wss://{hostname}/ws',
                            'private' => 'wss://{hostname}/ws',
                        ),
                    ),
                    'market' => 'https://{hostname}',
                    'public' => 'https://{hostname}',
                    'private' => 'https://{hostname}',
                ),
                'www' => 'https://www.huobi.co.jp',
                'referral' => 'https://www.huobi.co.jp/register/?invite_code=znnq3',
                'doc' => 'https://api-doc.huobi.co.jp',
                'fees' => 'https://www.huobi.co.jp/support/fee',
            ),
        ));
    }

    public function fetch_deposit_address($code, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositAddress not supported yet');
    }
}