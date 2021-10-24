<?php

namespace ccxtpro;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\AuthenticationError;

class okex extends \ccxt\async\okex {

    use ClientTrait;

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'has' => array(
                'ws' => true,
                'watchTicker' => true,
                // 'watchTickers' => false, // for now
                'watchOrderBook' => true,
                'watchTrades' => true,
                'watchBalance' => true,
                'watchOHLCV' => true,
            ),
            'urls' => array(
                'api' => array(
                    'ws' => array(
                        'public' => 'wss://ws.okex.com:8443/ws/v5/public', // wss://wsaws.okex.com:8443/ws/v5/public
                        'private' => 'wss://ws.okex.com:8443/ws/v5/private', // wss://wsaws.okex.com:8443/ws/v5/private
                    ),
                ),
                'test' => array(
                    'ws' => array(
                        'public' => 'wss://wspap.okex.com:8443/ws/v5/public?brokerId=9999',
                        'private' => 'wss://wspap.okex.com:8443/ws/v5/private?brokerId=9999',
                    ),
                ),
            ),
            'options' => array(
                'watchOrderBook' => array(
                    // books, 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms when there is change in order book.
                    // books5, 5 depth levels will be pushed every time. Data will be pushed every 100 ms when there is change in order book.
                    // books50-l2-tbt, 50 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                    // books-l2-tbt, 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                    'depth' => 'books-l2-tbt',
                ),
                'watchBalance' => 'spot', // margin, futures, swap
                'ws' => array(
                    // 'inflate' => true,
                ),
            ),
            'streaming' => array(
                // okex does not support built-in ws protocol-level ping-pong
                // instead it requires a custom text-based ping-pong
                'ping' => array($this, 'ping'),
                'keepAlive' => 20000,
            ),
        ));
    }

    public function subscribe($access, $channel, $symbol, $params = array ()) {
        yield $this->load_markets();
        $url = $this->urls['api']['ws'][$access];
        $messageHash = $channel;
        $firstArgument = array(
            'channel' => $channel,
        );
        if ($symbol !== null) {
            $market = $this->market($symbol);
            $messageHash .= ':' . $market['id'];
            $firstArgument['instId'] = $market['id'];
        }
        $request = array(
            'op' => 'subscribe',
            'args' => array(
                $this->deep_extend($firstArgument, $params),
            ),
        );
        return yield $this->watch($url, $messageHash, $request, $messageHash);
    }

    public function watch_trades($symbol, $since = null, $limit = null, $params = array ()) {
        $trades = yield $this->subscribe('public', 'trades', $symbol, $params);
        if ($this->newUpdates) {
            $limit = $trades->getLimit ($symbol, $limit);
        }
        return $this->filter_by_since_limit($trades, $since, $limit, 'timestamp', true);
    }

    public function handle_trades($client, $message) {
        //
        //     {
        //         $arg => array( $channel => 'trades', instId => 'BTC-USDT' ),
        //         $data => array(
        //             {
        //                 instId => 'BTC-USDT',
        //                 tradeId => '216970876',
        //                 px => '31684.5',
        //                 sz => '0.00001186',
        //                 side => 'buy',
        //                 ts => '1626531038288'
        //             }
        //         )
        //     }
        //
        $arg = $this->safe_value($message, 'arg', array());
        $channel = $this->safe_string($arg, 'channel');
        $data = $this->safe_value($message, 'data', array());
        $tradesLimit = $this->safe_integer($this->options, 'tradesLimit', 1000);
        for ($i = 0; $i < count($data); $i++) {
            $trade = $this->parse_trade($data[$i]);
            $symbol = $trade['symbol'];
            $marketId = $this->safe_string($trade['info'], 'instId');
            $messageHash = $channel . ':' . $marketId;
            $stored = $this->safe_value($this->trades, $symbol);
            if ($stored === null) {
                $stored = new ArrayCache ($tradesLimit);
                $this->trades[$symbol] = $stored;
            }
            $stored->append ($trade);
            $client->resolve ($stored, $messageHash);
        }
        return $message;
    }

    public function watch_ticker($symbol, $params = array ()) {
        return yield $this->subscribe('public', 'tickers', $symbol, $params);
    }

    public function handle_ticker($client, $message) {
        //
        //     {
        //         $arg => array( $channel => 'tickers', instId => 'BTC-USDT' ),
        //         $data => array(
        //             {
        //                 instType => 'SPOT',
        //                 instId => 'BTC-USDT',
        //                 last => '31500.1',
        //                 lastSz => '0.00001754',
        //                 askPx => '31500.1',
        //                 askSz => '0.00998144',
        //                 bidPx => '31500',
        //                 bidSz => '3.05652439',
        //                 open24h => '31697',
        //                 high24h => '32248',
        //                 low24h => '31165.6',
        //                 sodUtc0 => '31385.5',
        //                 sodUtc8 => '32134.9',
        //                 volCcy24h => '503403597.38138519',
        //                 vol24h => '15937.10781721',
        //                 ts => '1626526618762'
        //             }
        //         )
        //     }
        //
        $arg = $this->safe_value($message, 'arg', array());
        $channel = $this->safe_string($arg, 'channel');
        $data = $this->safe_value($message, 'data', array());
        for ($i = 0; $i < count($data); $i++) {
            $ticker = $this->parse_ticker($data[$i]);
            $symbol = $ticker['symbol'];
            $marketId = $this->safe_string($ticker['info'], 'instId');
            $messageHash = $channel . ':' . $marketId;
            $this->tickers[$symbol] = $ticker;
            $client->resolve ($ticker, $messageHash);
        }
        return $message;
    }

    public function watch_ohlcv($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $interval = $this->timeframes[$timeframe];
        $name = 'candle' . $interval;
        $ohlcv = yield $this->subscribe('public', $name, $symbol, $params);
        if ($this->newUpdates) {
            $limit = $ohlcv->getLimit ($symbol, $limit);
        }
        return $this->filter_by_since_limit($ohlcv, $since, $limit, 0, true);
    }

    public function handle_ohlcv($client, $message) {
        //
        //     {
        //         $arg => array( $channel => 'candle1m', instId => 'BTC-USDT' ),
        //         $data => array(
        //             array(
        //                 '1626690720000',
        //                 '31334',
        //                 '31334',
        //                 '31334',
        //                 '31334',
        //                 '0.0077',
        //                 '241.2718'
        //             )
        //         )
        //     }
        //
        $arg = $this->safe_value($message, 'arg', array());
        $channel = $this->safe_string($arg, 'channel');
        $data = $this->safe_value($message, 'data', array());
        $marketId = $this->safe_string($arg, 'instId');
        $market = $this->safe_market($marketId);
        $symbol = $market['id'];
        $interval = str_replace('candle', '', $channel);
        // use a reverse lookup in a static map instead
        $timeframe = $this->find_timeframe($interval);
        for ($i = 0; $i < count($data); $i++) {
            $parsed = $this->parse_ohlcv($data[$i], $market);
            $this->ohlcvs[$symbol] = $this->safe_value($this->ohlcvs, $symbol, array());
            $stored = $this->safe_value($this->ohlcvs[$symbol], $timeframe);
            if ($stored === null) {
                $limit = $this->safe_integer($this->options, 'OHLCVLimit', 1000);
                $stored = new ArrayCacheByTimestamp ($limit);
                $this->ohlcvs[$symbol][$timeframe] = $stored;
            }
            $stored->append ($parsed);
            $messageHash = $channel . ':' . $marketId;
            $client->resolve ($stored, $messageHash);
        }
    }

    public function watch_order_book($symbol, $limit = null, $params = array ()) {
        $options = $this->safe_value($this->options, 'watchOrderBook', array());
        // books, 400 $depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms when there is change in order book.
        // books5, 5 $depth levels will be pushed every time. Data will be pushed every 100 ms when there is change in order book.
        // books50-l2-tbt, 50 $depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
        // books-l2-tbt, 400 $depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
        $depth = $this->safe_string($options, 'depth', 'books-l2-tbt');
        $orderbook = yield $this->subscribe('public', $depth, $symbol, $params);
        return $orderbook->limit ($limit);
    }

    public function handle_delta($bookside, $delta) {
        //
        //     array(
        //         '31685', // $price
        //         '0.78069158', // $amount
        //         '0', // liquidated orders
        //         '17' // orders
        //     )
        //
        $price = $this->safe_float($delta, 0);
        $amount = $this->safe_float($delta, 1);
        $bookside->store ($price, $amount);
    }

    public function handle_deltas($bookside, $deltas) {
        for ($i = 0; $i < count($deltas); $i++) {
            $this->handle_delta($bookside, $deltas[$i]);
        }
    }

    public function handle_order_book_message($client, $message, $orderbook) {
        //
        //     {
        //         $asks => array(
        //             array( '31738.3', '0.05973179', '0', '3' ),
        //             array( '31738.5', '0.11035404', '0', '2' ),
        //             array( '31739.6', '0.01', '0', '1' ),
        //         ),
        //         $bids => array(
        //             array( '31738.2', '0.67557666', '0', '9' ),
        //             array( '31738', '0.02466947', '0', '2' ),
        //             array( '31736.3', '0.01705046', '0', '2' ),
        //         ),
        //         instId => 'BTC-USDT',
        //         ts => '1626537446491'
        //     }
        //
        $asks = $this->safe_value($message, 'asks', array());
        $bids = $this->safe_value($message, 'bids', array());
        $this->handle_deltas($orderbook['asks'], $asks);
        $this->handle_deltas($orderbook['bids'], $bids);
        $timestamp = $this->safe_integer($message, 'ts');
        $orderbook['timestamp'] = $timestamp;
        $orderbook['datetime'] = $this->iso8601($timestamp);
        return $orderbook;
    }

    public function handle_order_book($client, $message) {
        //
        // $snapshot
        //
        //     {
        //         $arg => array( $channel => 'books-l2-tbt', instId => 'BTC-USDT' ),
        //         $action => 'snapshot',
        //         $data => array(
        //             {
        //                 asks => array(
        //                     array( '31685', '0.78069158', '0', '17' ),
        //                     array( '31685.1', '0.0001', '0', '1' ),
        //                     array( '31685.6', '0.04543165', '0', '1' ),
        //                 ),
        //                 bids => array(
        //                     array( '31684.9', '0.01', '0', '1' ),
        //                     array( '31682.9', '0.0001', '0', '1' ),
        //                     array( '31680.7', '0.01', '0', '1' ),
        //                 ),
        //                 ts => '1626532416403',
        //                 checksum => -1023440116
        //             }
        //         )
        //     }
        //
        // $update
        //
        //     {
        //         $arg => array( $channel => 'books-l2-tbt', instId => 'BTC-USDT' ),
        //         $action => 'update',
        //         $data => array(
        //             {
        //                 asks => array(
        //                     array( '31657.7', '0', '0', '0' ),
        //                     array( '31659.7', '0.01', '0', '1' ),
        //                     array( '31987.3', '0.01', '0', '1' )
        //                 ),
        //                 bids => array(
        //                     array( '31642.9', '0.50296385', '0', '4' ),
        //                     array( '31639.9', '0', '0', '0' ),
        //                     array( '31638.7', '0.01', '0', '1' ),
        //                 ),
        //                 ts => '1626535709008',
        //                 checksum => 830931827
        //             }
        //         )
        //     }
        //
        // books5
        //
        //     {
        //         $arg => array( $channel => 'books5', instId => 'BTC-USDT' ),
        //         $data => array(
        //             {
        //                 asks => array(
        //                     array( '31738.3', '0.05973179', '0', '3' ),
        //                     array( '31738.5', '0.11035404', '0', '2' ),
        //                     array( '31739.6', '0.01', '0', '1' ),
        //                 ),
        //                 bids => array(
        //                     array( '31738.2', '0.67557666', '0', '9' ),
        //                     array( '31738', '0.02466947', '0', '2' ),
        //                     array( '31736.3', '0.01705046', '0', '2' ),
        //                 ),
        //                 instId => 'BTC-USDT',
        //                 ts => '1626537446491'
        //             }
        //         )
        //     }
        //
        $arg = $this->safe_value($message, 'arg', array());
        $channel = $this->safe_string($arg, 'channel');
        $action = $this->safe_string($message, 'action');
        $data = $this->safe_value($message, 'data', array());
        $marketId = $this->safe_string($arg, 'instId');
        $market = $this->safe_market($marketId);
        $symbol = $market['id'];
        $depths = array(
            'books' => 400,
            'books5' => 5,
            'books-l2-tbt' => 400,
            'books50-l2-tbt' => 50,
        );
        $limit = $this->safe_integer($depths, $channel);
        if ($action === 'snapshot') {
            for ($i = 0; $i < count($data); $i++) {
                $update = $data[$i];
                $orderbook = $this->order_book(array(), $limit);
                $this->orderbooks[$symbol] = $orderbook;
                $this->handle_order_book_message($client, $update, $orderbook);
                $messageHash = $channel . ':' . $marketId;
                $client->resolve ($orderbook, $messageHash);
            }
        } else if ($action === 'update') {
            if (is_array($this->orderbooks) && array_key_exists($symbol, $this->orderbooks)) {
                $orderbook = $this->orderbooks[$symbol];
                for ($i = 0; $i < count($data); $i++) {
                    $update = $data[$i];
                    $this->handle_order_book_message($client, $update, $orderbook);
                    $messageHash = $channel . ':' . $marketId;
                    $client->resolve ($orderbook, $messageHash);
                }
            }
        } else if ($channel === 'books5') {
            $orderbook = $this->safe_value($this->orderbooks, $symbol);
            if ($orderbook === null) {
                $orderbook = $this->order_book(array(), $limit);
            }
            $this->orderbooks[$symbol] = $orderbook;
            for ($i = 0; $i < count($data); $i++) {
                $update = $data[$i];
                $timestamp = $this->safe_integer($update, 'ts');
                $snapshot = $this->parse_order_book($update, $symbol, $timestamp, 'bids', 'asks', 0, 1, $market);
                $orderbook->reset ($snapshot);
                $messageHash = $channel . ':' . $marketId;
                $client->resolve ($orderbook, $messageHash);
            }
        }
        return $message;
    }

    public function authenticate($params = array ()) {
        $this->check_required_credentials();
        $url = $this->urls['api']['ws']['private'];
        $messageHash = 'login';
        $client = $this->client($url);
        $future = $this->safe_value($client->subscriptions, $messageHash);
        if ($future === null) {
            $future = $client->future ('authenticated');
            $timestamp = (string) $this->seconds();
            $method = 'GET';
            $path = '/users/self/verify';
            $auth = $timestamp . $method . $path;
            $signature = $this->hmac($this->encode($auth), $this->encode($this->secret), 'sha256', 'base64');
            $request = array(
                'op' => $messageHash,
                'args' => array(
                    array(
                        'apiKey' => $this->apiKey,
                        'passphrase' => $this->password,
                        'timestamp' => $timestamp,
                        'sign' => $signature,
                    ),
                ),
            );
            $this->spawn(array($this, 'watch'), $url, $messageHash, $request, $messageHash, $future);
        }
        return yield $future;
    }

    public function watch_balance($params = array ()) {
        yield $this->load_markets();
        yield $this->authenticate();
        return yield $this->subscribe('private', 'account', null, $params);
    }

    public function handle_balance($client, $message) {
        //
        //     {
        //         $arg => array( $channel => 'account' ),
        //         data => array(
        //             {
        //                 adjEq => '',
        //                 details => array(
        //                     array(
        //                         availBal => '',
        //                         availEq => '8.21009913',
        //                         cashBal => '8.21009913',
        //                         ccy => 'USDT',
        //                         coinUsdPrice => '0.99994',
        //                         crossLiab => '',
        //                         disEq => '8.2096065240522',
        //                         eq => '8.21009913',
        //                         eqUsd => '8.2096065240522',
        //                         frozenBal => '0',
        //                         interest => '',
        //                         isoEq => '0',
        //                         isoLiab => '',
        //                         liab => '',
        //                         maxLoan => '',
        //                         mgnRatio => '',
        //                         notionalLever => '0',
        //                         ordFrozen => '0',
        //                         twap => '0',
        //                         uTime => '1621927314996',
        //                         upl => '0'
        //                     ),
        //                 ),
        //                 imr => '',
        //                 isoEq => '0',
        //                 mgnRatio => '',
        //                 mmr => '',
        //                 notionalUsd => '',
        //                 ordFroz => '',
        //                 totalEq => '22.1930992296832',
        //                 uTime => '1626692120916'
        //             }
        //         )
        //     }
        //
        $arg = $this->safe_value($message, 'arg', array());
        $channel = $this->safe_string($arg, 'channel');
        $type = 'spot';
        $balance = $this->parseTradingBalance ($message);
        $oldBalance = $this->safe_value($this->balance, $type, array());
        $newBalance = $this->deep_extend($oldBalance, $balance);
        $this->balance[$type] = $this->parse_balance($newBalance);
        $client->resolve ($this->balance[$type], $channel);
    }

    public function watch_orders($symbol = null, $since = null, $limit = null, $params = array ()) {
        yield $this->load_markets();
        yield $this->authenticate();
        //
        //     {
        //         "op" => "subscribe",
        //         "args" => array(
        //             {
        //                 "channel" => "orders",
        //                 "instType" => "FUTURES",
        //                 "uly" => "BTC-USD",
        //                 "instId" => "BTC-USD-200329"
        //             }
        //         )
        //     }
        //
        $defaultType = $this->safe_string($this->options, 'defaultType');
        $options = $this->safe_string($this->options, 'watchOrders', array());
        $type = $this->safe_string($options, 'type', $defaultType);
        $type = $this->safe_string($params, 'type', $type);
        $params = $this->omit($params, 'type');
        $market = null;
        if ($symbol !== null) {
            $market = $this->market($symbol);
            $type = $market['type'];
        }
        $uppercaseType = strtoupper($type);
        $request = array(
            'instType' => $uppercaseType,
        );
        return yield $this->subscribe('private', 'orders', $symbol, array_merge($request, $params));
    }

    public function handle_subscription_status($client, $message) {
        //
        //     array( event => 'subscribe', arg => array( $channel => 'tickers', instId => 'BTC-USDT' ) )
        //
        // $channel = $this->safe_string($message, 'channel');
        // $client->subscriptions[$channel] = $message;
        return $message;
    }

    public function handle_authenticate($client, $message) {
        //
        //     array( event => 'login', success => true )
        //
        $client->resolve ($message, 'authenticated');
        return $message;
    }

    public function ping($client) {
        // okex does not support built-in ws protocol-level ping-pong
        // instead it requires custom text-based ping-pong
        return 'ping';
    }

    public function handle_pong($client, $message) {
        $client->lastPong = $this->milliseconds();
        return $message;
    }

    public function handle_error_message($client, $message) {
        //
        //     array( event => 'error', msg => 'Illegal request => array("op":"subscribe","args":["spot/ticker:BTC-USDT"])', code => '60012' )
        //     array( event => 'error', msg => "channel:ticker,instId:BTC-USDT doesn't exist", code => '60018' )
        //
        $errorCode = $this->safe_string($message, 'errorCode');
        try {
            if ($errorCode !== null) {
                $feedback = $this->id . ' ' . $this->json($message);
                $this->throw_exactly_matched_exception($this->exceptions['exact'], $errorCode, $feedback);
                $messageString = $this->safe_value($message, 'message');
                if ($messageString !== null) {
                    $this->throw_broadly_matched_exception($this->exceptions['broad'], $messageString, $feedback);
                }
            }
        } catch (Exception $e) {
            if ($e instanceof AuthenticationError) {
                $client->reject ($e, 'authenticated');
                $method = 'login';
                if (is_array($client->subscriptions) && array_key_exists($method, $client->subscriptions)) {
                    unset($client->subscriptions[$method]);
                }
                return false;
            }
        }
        return $message;
    }

    public function handle_message($client, $message) {
        if (!$this->handle_error_message($client, $message)) {
            return;
        }
        //
        //     array( $event => 'subscribe', $arg => array( $channel => 'tickers', instId => 'BTC-USDT' ) )
        //     array( $event => 'login', msg => '', code => '0' )
        //
        //     {
        //         $arg => array( $channel => 'tickers', instId => 'BTC-USDT' ),
        //         data => array(
        //             {
        //                 instType => 'SPOT',
        //                 instId => 'BTC-USDT',
        //                 last => '31500.1',
        //                 lastSz => '0.00001754',
        //                 askPx => '31500.1',
        //                 askSz => '0.00998144',
        //                 bidPx => '31500',
        //                 bidSz => '3.05652439',
        //                 open24h => '31697',
        //                 high24h => '32248',
        //                 low24h => '31165.6',
        //                 sodUtc0 => '31385.5',
        //                 sodUtc8 => '32134.9',
        //                 volCcy24h => '503403597.38138519',
        //                 vol24h => '15937.10781721',
        //                 ts => '1626526618762'
        //             }
        //         )
        //     }
        //
        //     array( $event => 'error', msg => 'Illegal request => array("op":"subscribe","args":["spot/ticker:BTC-USDT"])', code => '60012' )
        //     array( $event => 'error', msg => "$channel:ticker,instId:BTC-USDT doesn't exist", code => '60018' )
        //     array( $event => 'error', msg => 'Invalid OK_ACCESS_KEY', code => '60005' )
        //     {
        //         $event => 'error',
        //         msg => 'Illegal request => array("op":"login","args":["de89b035-b233-44b2-9a13-0ccdd00bda0e","7KUcc8YzQhnxBE3K","1626691289","H57N99mBt5NvW8U19FITrPdOxycAERFMaapQWRqLaSE="])',
        //         code => '60012'
        //     }
        //
        //
        //
        if ($message === 'pong') {
            return $this->handle_pong($client, $message);
        }
        // $table = $this->safe_string($message, 'table');
        // if ($table === null) {
        $event = $this->safe_string($message, 'event');
        if ($event !== null) {
            $methods = array(
                // 'info' => $this->handleSystemStatus,
                // 'book' => 'handleOrderBook',
                'login' => array($this, 'handle_authenticate'),
                'subscribe' => array($this, 'handle_subscription_status'),
            );
            $method = $this->safe_value($methods, $event);
            if ($method === null) {
                return $message;
            } else {
                return $method($client, $message);
            }
        } else {
            $arg = $this->safe_value($message, 'arg', array());
            $channel = $this->safe_string($arg, 'channel');
            $methods = array(
                'books' => array($this, 'handle_order_book'), // 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms when there is change in order book.
                'books5' => array($this, 'handle_order_book'), // 5 depth levels will be pushed every time. Data will be pushed every 100 ms when there is change in order book.
                'books50-l2-tbt' => array($this, 'handle_order_book'), // 50 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                'books-l2-tbt' => array($this, 'handle_order_book'), // 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                'tickers' => array($this, 'handle_ticker'),
                'trades' => array($this, 'handle_trades'),
                'account' => array($this, 'handle_balance'),
                // 'margin_account' => array($this, 'handle_balance'),
            );
            $method = $this->safe_value($methods, $channel);
            if ($method === null) {
                if (mb_strpos($channel, 'candle') === 0) {
                    $this->handle_ohlcv($client, $message);
                } else {
                    return $message;
                }
            } else {
                return $method($client, $message);
            }
        }
    }
}