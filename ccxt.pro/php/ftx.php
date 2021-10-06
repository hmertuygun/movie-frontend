<?php

namespace ccxtpro;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\ExchangeError;
use \ccxt\AuthenticationError;

class ftx extends \ccxt\async\ftx {

    use ClientTrait;

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'has' => array(
                'ws' => true,
                'watchOrderBook' => true,
                'watchTicker' => true,
                'watchTrades' => true,
                'watchOHLCV' => false, // missing on the exchange side
                'watchBalance' => false, // missing on the exchange side
                'watchOrders' => true,
                'watchMyTrades' => true,
            ),
            'urls' => array(
                'api' => array(
                    'ws' => 'wss://{hostname}/ws',
                ),
            ),
            'options' => array(
                'ordersLimit' => 1000,
                'tradesLimit' => 1000,
            ),
            'streaming' => array(
                // ftx does not support built-in ws protocol-level ping-pong
                // instead it requires a custom text-based ping-pong
                'ping' => array($this, 'ping'),
                'keepAlive' => 15000,
            ),
            'exceptions' => array(
                'exact' => array(
                    'Internal server error' => '\\ccxt\\ExchangeNotAvailable',
                    'Invalid login credentials' => '\\ccxt\\AuthenticationError',
                    'Not logged in' => '\\ccxt\\AuthenticationError',
                ),
            ),
        ));
    }

    public function watch_public($symbol, $channel, $params = array ()) {
        yield $this->load_markets();
        $market = $this->market($symbol);
        $marketId = $market['id'];
        $url = $this->implode_params($this->urls['api']['ws'], array( 'hostname' => $this->hostname ));
        $request = array(
            'op' => 'subscribe',
            'channel' => $channel,
            'market' => $marketId,
        );
        $messageHash = $channel . ':' . $marketId;
        return yield $this->watch($url, $messageHash, $request, $messageHash);
    }

    public function watch_private($channel, $symbol = null, $params = array ()) {
        yield $this->load_markets();
        $messageHash = $channel;
        if ($symbol !== null) {
            $market = $this->market($symbol);
            $messageHash = $messageHash . ':' . $market['id'];
        }
        yield $this->authenticate();
        $url = $this->implode_params($this->urls['api']['ws'], array( 'hostname' => $this->hostname ));
        $request = array(
            'op' => 'subscribe',
            'channel' => $channel,
        );
        return yield $this->watch($url, $messageHash, $request, $channel);
    }

    public function authenticate($params = array ()) {
        $url = $this->implode_params($this->urls['api']['ws'], array( 'hostname' => $this->hostname ));
        $client = $this->client($url);
        $authenticate = 'authenticate';
        $method = 'login';
        if (!(is_array($client->subscriptions) && array_key_exists($authenticate, $client->subscriptions))) {
            $this->check_required_credentials();
            $client->subscriptions[$authenticate] = true;
            $time = $this->milliseconds();
            $payload = (string) $time . 'websocket_login';
            $signature = $this->hmac($this->encode($payload), $this->encode($this->secret), 'sha256', 'hex');
            $messageArgs = array(
                'key' => $this->apiKey,
                'time' => $time,
                'sign' => $signature,
            );
            $options = $this->safe_value($this->options, 'sign', array());
            $headerPrefix = $this->safe_string($options, $this->hostname, 'FTX');
            $subaccount = $this->safe_string($this->headers, $headerPrefix . '-SUBACCOUNT');
            if ($subaccount !== null) {
                $messageArgs['subaccount'] = $subaccount;
            }
            $message = array(
                'args' => $messageArgs,
                'op' => $method,
            );
            // ftx does not reply to this $message
            $future = $this->watch($url, $method, $message);
            $future->resolve (true);
        }
        return $client->future ($method);
    }

    public function watch_ticker($symbol, $params = array ()) {
        return yield $this->watch_public($symbol, 'ticker');
    }

    public function watch_trades($symbol, $since = null, $limit = null, $params = array ()) {
        $trades = yield $this->watch_public($symbol, 'trades');
        if ($this->newUpdates) {
            $limit = $trades->getLimit ($symbol, $limit);
        }
        return $this->filter_by_since_limit($trades, $since, $limit, 'timestamp', true);
    }

    public function watch_order_book($symbol, $limit = null, $params = array ()) {
        $orderbook = yield $this->watch_public($symbol, 'orderbook');
        return $orderbook->limit ($limit);
    }

    public function handle_partial($client, $message) {
        $methods = array(
            'orderbook' => array($this, 'handle_order_book_snapshot'),
        );
        $methodName = $this->safe_string($message, 'channel');
        $method = $this->safe_value($methods, $methodName);
        if ($method) {
            $method($client, $message);
        }
    }

    public function handle_update($client, $message) {
        $methods = array(
            'trades' => array($this, 'handle_trade'),
            'ticker' => array($this, 'handle_ticker'),
            'orderbook' => array($this, 'handle_order_book_update'),
            'orders' => array($this, 'handle_order'),
            'fills' => array($this, 'handle_my_trade'),
        );
        $methodName = $this->safe_string($message, 'channel');
        $method = $this->safe_value($methods, $methodName);
        if ($method) {
            $method($client, $message);
        }
    }

    public function handle_message($client, $message) {
        $methods = array(
            // ftx API docs say that all tickers and trades will be "partial"
            // however, in fact those are "update"
            // therefore we don't need to parse the "partial" update
            // since it is only used for orderbooks...
            // uncomment to fix if this is wrong
            // 'partial' => array($this, 'handle_partial'),
            'partial' => array($this, 'handle_order_book_snapshot'),
            'update' => array($this, 'handle_update'),
            'subscribed' => array($this, 'handle_subscription_status'),
            'unsubscribed' => array($this, 'handle_unsubscription_status'),
            'info' => array($this, 'handle_info'),
            'error' => array($this, 'handle_error'),
            'pong' => array($this, 'handle_pong'),
        );
        $methodName = $this->safe_string($message, 'type');
        $method = $this->safe_value($methods, $methodName);
        if ($method) {
            $method($client, $message);
        }
    }

    public function get_message_hash($message) {
        $channel = $this->safe_string($message, 'channel');
        $marketId = $this->safe_string($message, 'market');
        return $channel . ':' . $marketId;
    }

    public function handle_ticker($client, $message) {
        //
        //     {
        //         channel => 'ticker',
        //         $market => 'BTC/USD',
        //         type => 'update',
        //         $data => {
        //             bid => 6652,
        //             ask => 6653,
        //             bidSize => 17.6608,
        //             askSize => 18.1869,
        //             last => 6655,
        //             time => 1585787827.3118029
        //         }
        //     }
        //
        $data = $this->safe_value($message, 'data', array());
        $marketId = $this->safe_string($message, 'market');
        if (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id)) {
            $market = $this->markets_by_id[$marketId];
            $ticker = $this->parse_ticker($data, $market);
            $symbol = $ticker['symbol'];
            $this->tickers[$symbol] = $ticker;
            $messageHash = $this->get_message_hash($message);
            $client->resolve ($ticker, $messageHash);
        }
        return $message;
    }

    public function handle_order_book_snapshot($client, $message) {
        //
        //     {
        //         channel => "$orderbook",
        //         $market => "BTC/USD",
        //         type => "partial",
        //         $data => {
        //             time => 1585812237.6300597,
        //             $checksum => 2028058404,
        //             bids => [
        //                 [6655.5, 21.23],
        //                 [6655, 41.0165],
        //                 [6652.5, 15.1985],
        //             ],
        //             asks => [
        //                 [6658, 48.8094],
        //                 [6659.5, 15.6184],
        //                 [6660, 16.7178],
        //             ],
        //             action => "partial"
        //         }
        //     }
        //
        $data = $this->safe_value($message, 'data', array());
        $marketId = $this->safe_string($message, 'market');
        if (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id)) {
            $market = $this->markets_by_id[$marketId];
            $symbol = $market['symbol'];
            $options = $this->safe_value($this->options, 'watchOrderBook', array());
            $limit = $this->safe_integer($options, 'limit', 400);
            $orderbook = $this->order_book(array(), $limit);
            $this->orderbooks[$symbol] = $orderbook;
            $timestamp = $this->safe_timestamp($data, 'time');
            $snapshot = $this->parse_order_book($data, $symbol, $timestamp);
            $orderbook->reset ($snapshot);
            // $checksum = $this->safe_string($data, 'checksum');
            // todo => $this->checkOrderBookChecksum ($client, $orderbook, $checksum);
            $this->orderbooks[$symbol] = $orderbook;
            $messageHash = $this->get_message_hash($message);
            $client->resolve ($orderbook, $messageHash);
        }
    }

    public function handle_delta($bookside, $delta) {
        $price = $this->safe_float($delta, 0);
        $amount = $this->safe_float($delta, 1);
        $bookside->store ($price, $amount);
    }

    public function handle_deltas($bookside, $deltas) {
        for ($i = 0; $i < count($deltas); $i++) {
            $this->handle_delta($bookside, $deltas[$i]);
        }
    }

    public function handle_order_book_update($client, $message) {
        //
        //     {
        //         channel => "$orderbook",
        //         $market => "BTC/USD",
        //         type => "update",
        //         $data => {
        //             time => 1585812417.4673214,
        //             $checksum => 2215307596,
        //             bids => [[6668, 21.4066], [6669, 25.8738], [4498, 0]],
        //             asks => array(),
        //             action => "update"
        //         }
        //     }
        //
        $data = $this->safe_value($message, 'data', array());
        $marketId = $this->safe_string($message, 'market');
        if (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id)) {
            $market = $this->markets_by_id[$marketId];
            $symbol = $market['symbol'];
            $orderbook = $this->orderbooks[$symbol];
            $this->handle_deltas($orderbook['asks'], $this->safe_value($data, 'asks', array()));
            $this->handle_deltas($orderbook['bids'], $this->safe_value($data, 'bids', array()));
            // $orderbook['nonce'] = u;
            $timestamp = $this->safe_timestamp($data, 'time');
            $orderbook['timestamp'] = $timestamp;
            $orderbook['datetime'] = $this->iso8601($timestamp);
            // $checksum = $this->safe_string($data, 'checksum');
            // todo => $this->checkOrderBookChecksum ($client, $orderbook, $checksum);
            $this->orderbooks[$symbol] = $orderbook;
            $messageHash = $this->get_message_hash($message);
            $client->resolve ($orderbook, $messageHash);
        }
    }

    public function handle_trade($client, $message) {
        //
        //     {
        //         channel =>   "$trades",
        //         $market =>   "BTC-PERP",
        //         type =>   "update",
        //         $data => array(
        //             {
        //                 id =>  33517246,
        //                 price =>  6661.5,
        //                 size =>  2.3137,
        //                 side => "sell",
        //                 liquidation =>  false,
        //                 time => "2020-04-02T07:45:12.011352+00:00"
        //             }
        //         )
        //     }
        //
        $data = $this->safe_value($message, 'data', array());
        $marketId = $this->safe_string($message, 'market');
        if (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id)) {
            $market = $this->markets_by_id[$marketId];
            $symbol = $market['symbol'];
            $messageHash = $this->get_message_hash($message);
            $tradesLimit = $this->safe_integer($this->options, 'tradesLimit', 1000);
            $stored = $this->safe_value($this->trades, $symbol);
            if ($stored === null) {
                $stored = new ArrayCache ($tradesLimit);
                $this->trades[$symbol] = $stored;
            }
            if (gettype($data) === 'array' && count(array_filter(array_keys($data), 'is_string')) == 0) {
                $trades = $this->parse_trades($data, $market);
                for ($i = 0; $i < count($trades); $i++) {
                    $stored->append ($trades[$i]);
                }
            } else {
                $trade = $this->parse_trade($message, $market);
                $stored->append ($trade);
            }
            $client->resolve ($stored, $messageHash);
        }
        return $message;
    }

    public function handle_subscription_status($client, $message) {
        // todo => handle unsubscription status
        // array('type' => 'subscribed', 'channel' => 'trades', 'market' => 'BTC-PERP')
        return $message;
    }

    public function handle_unsubscription_status($client, $message) {
        // todo => handle unsubscription status
        // array('type' => 'unsubscribed', 'channel' => 'trades', 'market' => 'BTC-PERP')
        return $message;
    }

    public function handle_info($client, $message) {
        // todo => handle info messages
        // Used to convey information to the user. Is accompanied by a code and msg field.
        // When our servers restart, you may see an info $message with code 20001. If you do, please reconnect.
        return $message;
    }

    public function handle_error($client, $message) {
        $errorMessage = $this->safe_string($message, 'msg');
        $Exception = $this->safe_value($this->exceptions['exact'], $errorMessage);
        if ($Exception === null) {
            $error = new ExchangeError ($errorMessage);
            $client->reject ($error);
        } else {
            if ($Exception instanceof AuthenticationError) {
                $method = 'authenticate';
                if (is_array($client->subscriptions) && array_key_exists($method, $client->subscriptions)) {
                    unset($client->subscriptions[$method]);
                }
            }
            $error = new $Exception ($errorMessage);
            // just reject the private api futures
            $client->reject ($error, 'fills');
            $client->reject ($error, 'orders');
        }
        return $message;
    }

    public function ping($client) {
        // ftx does not support built-in ws protocol-level ping-pong
        // instead it requires a custom json-based text ping-pong
        // https://docs.ftx.com/#websocket-api
        return array(
            'op' => 'ping',
        );
    }

    public function handle_pong($client, $message) {
        $client->lastPong = $this->milliseconds();
        return $message;
    }

    public function watch_orders($symbol = null, $since = null, $limit = null, $params = array ()) {
        yield $this->load_markets();
        $orders = yield $this->watch_private('orders', $symbol);
        if ($this->newUpdates) {
            $limit = $orders->getLimit ($symbol, $limit);
        }
        return $this->filter_by_symbol_since_limit($orders, $symbol, $since, $limit, true);
    }

    public function handle_order($client, $message) {
        //
        // futures
        //
        //     {
        //         channel => 'orders',
        //         type => 'update',
        //         $data => {
        //             id => 8047498974,
        //             clientId => null,
        //             $market => 'ETH-PERP',
        //             type => 'limit',
        //             side => 'buy',
        //             price => 300,
        //             size => 0.1,
        //             status => 'closed',
        //             filledSize => 0,
        //             remainingSize => 0,
        //             reduceOnly => false,
        //             liquidation => false,
        //             avgFillPrice => null,
        //             postOnly => false,
        //             ioc => false,
        //             createdAt => '2020-08-22T14:35:07.861545+00:00'
        //         }
        //     }
        //
        // spot
        //
        //     {
        //         channel => 'orders',
        //         type => 'update',
        //         $data => {
        //             id => 8048834542,
        //             clientId => null,
        //             $market => 'ETH/USD',
        //             type => 'limit',
        //             side => 'buy',
        //             price => 300,
        //             size => 0.1,
        //             status => 'new',
        //             filledSize => 0,
        //             remainingSize => 0.1,
        //             reduceOnly => false,
        //             liquidation => false,
        //             avgFillPrice => null,
        //             postOnly => false,
        //             ioc => false,
        //             createdAt => '2020-08-22T15:17:32.184123+00:00'
        //         }
        //     }
        //
        $messageHash = $this->safe_string($message, 'channel');
        $data = $this->safe_value($message, 'data');
        $order = $this->parse_order($data);
        $market = $this->market($order['symbol']);
        if ($this->orders === null) {
            $limit = $this->safe_integer($this->options, 'ordersLimit', 1000);
            $this->orders = new ArrayCacheBySymbolById ($limit);
        }
        $orders = $this->orders;
        $orders->append ($order);
        $client->resolve ($orders, $messageHash);
        $symbolMessageHash = $messageHash . ':' . $market['id'];
        $client->resolve ($orders, $symbolMessageHash);
    }

    public function watch_my_trades($symbol = null, $since = null, $limit = null, $params = array ()) {
        yield $this->load_markets();
        $trades = yield $this->watch_private('fills', $symbol);
        if ($this->newUpdates) {
            $limit = $trades->getLimit ($symbol, $limit);
        }
        return $this->filter_by_symbol_since_limit($trades, $symbol, $since, $limit, true);
    }

    public function handle_my_trade($client, $message) {
        //
        // future
        //
        //     {
        //         "channel" => "fills",
        //         "type" => "update"
        //         "$data" => array(
        //             "fee" => 78.05799225,
        //             "feeRate" => 0.0014,
        //             "future" => "BTC-PERP",
        //             "id" => 7828307,
        //             "liquidity" => "taker",
        //             "$market" => "BTC-PERP",
        //             "orderId" => 38065410,
        //             "price" => 3723.75,
        //             "side" => "buy",
        //             "size" => 14.973,
        //             "time" => "2019-05-07T16:40:58.358438+00:00",
        //             "tradeId" => 19129310,
        //             "type" => "order"
        //         ),
        //     }
        //
        // spot
        //
        //     {
        //         channel => 'fills',
        //         type => 'update',
        //         $data => {
        //             baseCurrency => 'ETH',
        //             quoteCurrency => 'USD',
        //             feeCurrency => 'USD',
        //             fee => 0.0023439654,
        //             feeRate => 0.000665,
        //             future => null,
        //             id => 182349460,
        //             liquidity => 'taker'
        //             $market => 'ETH/USD',
        //             orderId => 8049570214,
        //             price => 391.64,
        //             side => 'sell',
        //             size => 0.009,
        //             time => '2020-08-22T15:42:42.646980+00:00',
        //             tradeId => 90614141,
        //             type => 'order',
        //         }
        //     }
        //
        $messageHash = $this->safe_string($message, 'channel');
        $data = $this->safe_value($message, 'data', array());
        $trade = $this->parse_trade($data);
        $market = $this->market($trade['symbol']);
        if ($this->myTrades === null) {
            $limit = $this->safe_integer($this->options, 'tradesLimit', 1000);
            $this->myTrades = new ArrayCacheBySymbolById ($limit);
        }
        $tradesCache = $this->myTrades;
        $tradesCache->append ($trade);
        $client->resolve ($tradesCache, $messageHash);
        $symbolMessageHash = $messageHash . ':' . $market['id'];
        $client->resolve ($tradesCache, $symbolMessageHash);
    }
}
