import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "*"
}));

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/v2/api'; // Etherscan v2 base URL
const CHAIN_ID = 10143; // Monad testnet

// Balance endpoint
app.get('/api/balance/:address', async (req, res) => {
  const address = req.params.address;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        chainid: CHAIN_ID,
        module: 'account',
        action: 'balance',
        address,
        tag: 'latest',
        apikey: ETHERSCAN_API_KEY,
      }
    });
    if (response.data.status !== "1") {
      return res.status(400).json({ error: response.data.message || "Error fetching balance" });
    }
    res.json({ balanceMON: response.data.result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Transactions count endpoint
app.get('/api/txcount/:address', async (req, res) => {
  const address = req.params.address;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        chainid: CHAIN_ID,
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: ETHERSCAN_API_KEY,
      }
    });
    if (response.data.status !== "1") {
      return res.status(400).json({ error: response.data.message || "Error fetching transactions" });
    }
    const txlist = response.data.result || [];
    res.json({ txCount: txlist.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Contract count endpoint (nombre de contrats différents appelés)
app.get('/api/contractcount/:address', async (req, res) => {
  const address = req.params.address;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        chainid: CHAIN_ID,
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: ETHERSCAN_API_KEY,
      }
    });
    if (response.data.status !== "1") {
      return res.status(400).json({ error: response.data.message || "Error fetching transactions" });
    }
    const txlist = response.data.result || [];
    // On récupère les adresses 'to' des transactions qui ne sont pas null et différentes du wallet
    const contracts = new Set();
    txlist.forEach(tx => {
      if (tx.to && tx.to.toLowerCase() !== address.toLowerCase()) {
        contracts.add(tx.to.toLowerCase());
      }
    });
    res.json({ contractCount: contracts.size });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Tokens endpoint (à adapter selon ta source, ici exemple vide)
app.get('/api/tokens/:address', async (req, res) => {
  // TODO: Remplacer par un appel réel pour récupérer les tokens du wallet
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`✅ Backend Etherscan v2 started at http://localhost:${PORT}`);
});
