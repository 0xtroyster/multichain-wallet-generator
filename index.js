#!/usr/bin/env node

import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import fs from 'fs';
import promptSync from 'prompt-sync';
import path from 'path';
import { ethers } from 'ethers';

process.env.TERM = process.env.TERM || 'xterm-256color';

const prompt = promptSync({ sigint: true });

const supportsColor = true; 

const Colors = {
  PINK: '\x1b[95m',
  BLUE: '\x1b[94m',
  CYAN: '\x1b[96m',
  GREEN: '\x1b[92m',
  YELLOW: '\x1b[93m',
  RED: '\x1b[91m',
  BOLD: '\x1b[1m',
  UNDERLINE: '\x1b[4m',
  RESET: '\x1b[0m'
};

function colorText(text, color) {
  return `${color}${text}${Colors.RESET}`;
}

function testColors() {
  console.log('\x1b[30m%s\x1b[0m', 'Black');
  console.log('\x1b[31m%s\x1b[0m', 'Red');
  console.log('\x1b[32m%s\x1b[0m', 'Green');
  console.log('\x1b[33m%s\x1b[0m', 'Yellow');
  console.log('\x1b[34m%s\x1b[0m', 'Blue');
  console.log('\x1b[35m%s\x1b[0m', 'Magenta/Pink');
  console.log('\x1b[36m%s\x1b[0m', 'Cyan');
  console.log('\x1b[37m%s\x1b[0m', 'White');
  console.log('\x1b[95m%s\x1b[0m', 'Bright Magenta/Pink');
}

function printBanner() {
  const banner = `
         ,                 ██████╗ ██╗███╗   ██╗██╗  ██╗███████╗██╗  ██╗ █████╗ ██████╗ ██╗  ██╗
       .';                 ██╔══██╗██║████╗  ██║██║ ██╔╝██╔════╝██║  ██║██╔══██╗██╔══██╗██║ ██╔╝
   .-'\` .'                 ██████╔╝██║██╔██╗ ██║█████╔╝ ███████╗███████║███████║██████╔╝█████╔╝ 
 ,\`.-'-.\\                 ██╔═══╝ ██║██║╚██╗██║██╔═██╗ ╚════██║██╔══██║██╔══██║██╔══██╗██╔═██╗ 
; /     '-'                ██║     ██║██║ ╚████║██║  ██╗███████║██║  ██║██║  ██║██║  ██║██║  ██╗
| \\       ,-,              ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
\\  '-.__   )_\`'._     
 '.     \`\`\`      \`\`'--._          
.-' ,                   \`'-.   
 '-'\`-._           ((   o   )    
        \`'--....\`- ,__..--'     
                 '-'\`            
`;

  try {
    console.log('\x1b[95m' + banner + '\x1b[0m');
    console.log('\x1b[95m\x1b[1m' + '★'.repeat(20) + ' MULTICHAIN WALLET GENERATOR v1.0 ' + '★'.repeat(20) + '\x1b[0m');
  } catch (error) {
    try {
      process.stdout.write('\x1b[95m' + banner + '\x1b[0m\n');
      process.stdout.write('\x1b[95m\x1b[1m' + '★'.repeat(20) + ' MULTICHAIN WALLET GENERATOR v1.0 ' + '★'.repeat(20) + '\x1b[0m\n');
    } catch (error) {
      try {
        const lines = banner.split('\n');
        for (const line of lines) {
          console.log('\x1b[95m' + line + '\x1b[0m');
        }
        console.log('\x1b[95m\x1b[1m' + '★'.repeat(20) + ' MULTICHAIN WALLET GENERATOR v1.0 ' + '★'.repeat(20) + '\x1b[0m');
      } catch (error) {
        console.log(banner);
        console.log('★'.repeat(20) + ' MULTICHAIN WALLET GENERATOR v1.0 ' + '★'.repeat(20));
      }
    }
  }
}

// Chain types enum
const CHAIN_TYPES = {
  SOLANA: 'solana',
  ETHEREUM: 'ethereum',
  POLYGON: 'polygon',
  ARBITRUM: 'arbitrum',
  OPTIMISM: 'optimism'
};

// Generate a wallet from mnemonic
async function generateWalletFromMnemonic(chainType) {
  try {
    const mnemonic = bip39.generateMnemonic(256);
    
    if (chainType === CHAIN_TYPES.SOLANA) {
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const seedBuffer = Buffer.from(seed).slice(0, 32);
      const keypair = Keypair.fromSeed(seedBuffer);
      
      return {
        chain: 'Solana',
        address: keypair.publicKey.toString(),
        privateKeyBase58: bs58.encode(keypair.secretKey),
        privateKeyHex: Buffer.from(keypair.secretKey).toString('hex'),
        mnemonic: mnemonic
      };
    } else {
      // For Ethereum-compatible chains (Ethereum, Polygon, Arbitrum, Optimism)
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);
      
      let chain = 'Ethereum';
      
      switch (chainType) {
        case CHAIN_TYPES.POLYGON:
          chain = 'Polygon';
          break;
        case CHAIN_TYPES.ARBITRUM:
          chain = 'Arbitrum';
          break;
        case CHAIN_TYPES.OPTIMISM:
          chain = 'Optimism';
          break;
      }
      
      return {
        chain: chain,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: mnemonic
      };
    }
  } catch (error) {
    console.error(`Error generating ${chainType} wallet from mnemonic:`, error);
    throw error;
  }
}

// Generate a random wallet
function generateRandomWallet(chainType) {
  try {
    if (chainType === CHAIN_TYPES.SOLANA) {
      const keypair = Keypair.generate();
      
      return {
        chain: 'Solana',
        address: keypair.publicKey.toString(),
        privateKeyBase58: bs58.encode(keypair.secretKey),
        privateKeyHex: Buffer.from(keypair.secretKey).toString('hex'),
        mnemonic: "N/A (Random generation)"
      };
    } else {
      // For Ethereum-compatible chains
      const wallet = ethers.Wallet.createRandom();
      
      let chain = 'Ethereum';
      
      switch (chainType) {
        case CHAIN_TYPES.POLYGON:
          chain = 'Polygon';
          break;
        case CHAIN_TYPES.ARBITRUM:
          chain = 'Arbitrum';
          break;
        case CHAIN_TYPES.OPTIMISM:
          chain = 'Optimism';
          break;
      }
      
      return {
        chain: chain,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
      };
    }
  } catch (error) {
    console.error(`Error generating random ${chainType} wallet:`, error);
    throw error;
  }
}

// Save wallets to a file
function saveToFile(wallets) {
  try {
    // สร้างโฟลเดอร์ DATAwallet ถ้ายังไม่มี
    const folderPath = 'DATAwallet';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(colorText(`Created directory: ${folderPath}`, Colors.GREEN));
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(folderPath, `multichain_wallets_${timestamp}.js`);
    
    let content = 'const walletLists = [\n';
    
    wallets.forEach((wallet, index) => {
      content += '  {\n';
      content += `    "chain": "${wallet.chain}",\n`;
      content += `    "address": "${wallet.address}",\n`;
      
      if (wallet.chain === 'Solana') {
        content += `    "privateKeyBase58": "${wallet.privateKeyBase58}",\n`;
        content += `    "privateKeyHex": "${wallet.privateKeyHex}",\n`;
      } else {
        content += `    "privateKey": "${wallet.privateKey}",\n`;
      }
      
      content += `    "mnemonic": "${wallet.mnemonic}"\n`;
      content += '  }';
      
      if (index < wallets.length - 1) {
        content += ',';
      }
      
      content += '\n';
    });
    
    content += '];\n\n';
    content += 'module.exports = { walletLists };';
    
    const warning = "// WARNING: This file contains sensitive information. Keep it secure and do not share it.\n\n";
    
    fs.writeFileSync(filename, warning + content);
    console.log(colorText(`Wallets saved to ${filename}`, Colors.GREEN));
    
    return path.resolve(filename);
  } catch (error) {
    console.error(colorText('Error saving wallets to file:', Colors.RED), error);
    throw error;
  }
}

// Get a valid number of wallets to generate
function getValidWalletCount() {
  let count;
  
  while (true) {
    const input = prompt(colorText('How many wallet addresses do you want to generate? ', Colors.YELLOW));
    count = parseInt(input);
    
    if (!isNaN(count) && count > 0) {
      return count;
    }
    
    console.log(colorText('Please enter a valid number greater than 0.', Colors.RED));
  }
}

// Select which chains to generate wallets for
function selectChain() {
  console.log(colorText('\nAvailable chains:', Colors.BOLD + Colors.CYAN));
  console.log(colorText('1. Solana', Colors.GREEN));
  console.log(colorText('2. Ethereum', Colors.BLUE));
  console.log(colorText('3. Polygon (Ethereum L2)', Colors.PINK));
  console.log(colorText('4. Arbitrum (Ethereum L2)', Colors.YELLOW));
  console.log(colorText('5. Optimism (Ethereum L2)', Colors.RED));
  console.log(colorText('6. All chains', Colors.CYAN));
  
  while (true) {
    const selection = prompt(colorText('\nSelect chain (1-6): ', Colors.YELLOW));
    const option = parseInt(selection);
    
    if (!isNaN(option) && option >= 1 && option <= 6) {
      switch (option) {
        case 1: return [CHAIN_TYPES.SOLANA];
        case 2: return [CHAIN_TYPES.ETHEREUM];
        case 3: return [CHAIN_TYPES.POLYGON];
        case 4: return [CHAIN_TYPES.ARBITRUM];
        case 5: return [CHAIN_TYPES.OPTIMISM];
        case 6: return [
          CHAIN_TYPES.SOLANA,
          CHAIN_TYPES.ETHEREUM,
          CHAIN_TYPES.POLYGON,
          CHAIN_TYPES.ARBITRUM,
          CHAIN_TYPES.OPTIMISM
        ];
      }
    }
    
    console.log(colorText('Please enter a valid option (1-6).', Colors.RED));
  }
}

// ฟังก์ชันตรวจสอบสภาพแวดล้อมและให้คำแนะนำถ้าเกิดปัญหา
function checkEnvironment() {
  // ตรวจสอบว่ารองรับการแสดงสีหรือไม่
  const hasColorSupport = process.stdout.isTTY && 
                        (process.platform === 'linux' || 
                         process.env.TERM && 
                         (process.env.TERM.includes('color') || 
                          process.env.TERM === 'xterm-256color' || 
                          process.env.TERM === 'xterm'));
  
  // แสดงข้อมูลสภาพแวดล้อม
  console.log('Environment information:');
  console.log(`- Platform: ${process.platform}`);
  console.log(`- TERM: ${process.env.TERM || 'Not set'}`);
  console.log(`- Color support: ${hasColorSupport ? 'Likely Yes' : 'Likely No'}`);
  
  if (!hasColorSupport) {
    console.log('\nColor support might be limited. Try these solutions:');
    console.log('1. Set TERM environment variable:');
    console.log('   export TERM=xterm-256color');
    console.log('2. Run with node directly:');
    console.log('   node index.js');
    console.log('3. Test color support:');
    console.log('   node index.js --test-colors');
  }
  
  console.log('\n');
}

// ฟังก์ชันเช็คและแสดงรายการไฟล์ wallet ที่มีอยู่
function checkExistingWallets(silent = false) {
  try {
    const folderPath = 'DATAwallet';
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      if (!silent) {
        console.log(colorText(`Created directory: ${folderPath}`, Colors.GREEN));
        console.log(colorText('No existing wallet files found.', Colors.YELLOW));
      }
      return [];
    }
    
    // อ่านรายการไฟล์ทั้งหมดในโฟลเดอร์
    const files = fs.readdirSync(folderPath)
      .filter(file => file.startsWith('multichain_wallets_') && file.endsWith('.js'))
      .sort() // เรียงลำดับตามชื่อ (ซึ่งมี timestamp)
      .map(file => path.join(folderPath, file));
    
    if (!silent) {
      if (files.length === 0) {
        console.log(colorText('No existing wallet files found.', Colors.YELLOW));
      } else {
        console.log(colorText(`Found ${files.length} existing wallet file(s):`, Colors.CYAN));
        files.forEach((file, index) => {
          const stats = fs.statSync(file);
          const createdDate = new Date(stats.birthtime).toLocaleString();
          console.log(colorText(`${index + 1}. ${path.basename(file)} (Created: ${createdDate})`, Colors.YELLOW));
        });
      }
    }
    
    return files;
  } catch (error) {
    if (!silent) {
      console.error(colorText('Error checking existing wallets:', Colors.RED), error);
    }
    return [];
  }
}

// ฟังก์ชันลบไฟล์ wallet เก่า
function deleteOldWallets(keepLatest = 5) {
  try {
    const files = checkExistingWallets(true); // ไม่แสดงข้อความเมื่อตรวจสอบไฟล์
    
    if (files.length === 0) {
      console.log(colorText('No wallet files to delete.', Colors.YELLOW));
      return;
    }
    
    // กรณีต้องการลบไฟล์ทั้งหมด
    if (keepLatest === 0) {
      console.log(colorText(`Deleting all ${files.length} wallet file(s)...`, Colors.YELLOW));
      
      files.forEach(file => {
        fs.unlinkSync(file);
        console.log(colorText(`Deleted: ${path.basename(file)}`, Colors.RED));
      });
      
      console.log(colorText('All wallet files have been deleted.', Colors.GREEN));
      return;
    }
    
    // กรณีมีไฟล์น้อยกว่าหรือเท่ากับจำนวนที่ต้องการเก็บ
    if (files.length <= keepLatest) {
      console.log(colorText(`Keeping all ${files.length} wallet file(s). No files were deleted.`, Colors.GREEN));
      return;
    }
    
    // เลือกไฟล์เก่าที่จะลบ (ทั้งหมดยกเว้น keepLatest ไฟล์ล่าสุด)
    const filesToDelete = files.slice(0, files.length - keepLatest);
    const filesToKeep = files.slice(files.length - keepLatest);
    
    console.log(colorText(`Deleting ${filesToDelete.length} old wallet file(s)...`, Colors.YELLOW));
    
    filesToDelete.forEach(file => {
      fs.unlinkSync(file);
      console.log(colorText(`Deleted: ${path.basename(file)}`, Colors.RED));
    });
    
    console.log(colorText(`Kept ${keepLatest} most recent wallet file(s):`, Colors.GREEN));
    filesToKeep.forEach((file, index) => {
      console.log(colorText(`  ${index + 1}. ${path.basename(file)}`, Colors.YELLOW));
    });
  } catch (error) {
    console.error(colorText('Error deleting old wallets:', Colors.RED), error);
  }
}

// ฟังก์ชันแสดงข้อมูลการใช้งาน
function showHelp() {
  console.log(colorText('\n=== Multichain Wallet Generator - Help ===\n', Colors.BOLD + Colors.CYAN));
  console.log('Usage: node index.js [options]\n');
  
  console.log(colorText('Available options:', Colors.BOLD));
  console.log(colorText('  --help', Colors.YELLOW) + '                  Show this help message');
  console.log(colorText('  --test-colors', Colors.YELLOW) + '           Test terminal color support');
  console.log(colorText('  --check-env', Colors.YELLOW) + '             Check environment settings');
  console.log(colorText('  --list-wallets', Colors.YELLOW) + '          List all wallet files in DATAwallet folder');
  console.log(colorText('  --clean-wallets', Colors.YELLOW) + '         Delete old wallet files (keeps 5 most recent by default)');
  console.log(colorText('  --clean-wallets --keep <n>', Colors.YELLOW) + '  Delete old wallet files, keeping only <n> most recent');
  console.log(colorText('  --clean-wallets --keep 0', Colors.YELLOW) + '    Delete ALL wallet files (use with caution)');
  
  console.log(colorText('\nExamples:', Colors.BOLD));
  console.log('  node index.js                            Generate new wallets');
  console.log('  node index.js --list-wallets             List all existing wallet files');
  console.log('  node index.js --clean-wallets            Clean up old wallet files, keep 5 most recent');
  console.log('  node index.js --clean-wallets --keep 3   Clean up and keep only 3 most recent files');
  console.log('  node index.js --clean-wallets --keep 0   Delete ALL wallet files (use with caution)');
  
  console.log(colorText('\nOutput folder:', Colors.BOLD));
  console.log('  All wallet files are saved in the ' + colorText('DATAwallet', Colors.YELLOW) + ' folder');
  console.log('  Your wallet files contain PRIVATE KEYS - keep them secure!\n');
}

// Main function
async function main() {
  // ตรวจสอบถ้ามีพารามิเตอร์พิเศษ
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    return;
  }
  
  if (process.argv.includes('--test-colors')) {
    console.log('Testing terminal color support:');
    testColors();
    return;
  }
  
  if (process.argv.includes('--check-env')) {
    checkEnvironment();
    return;
  }
  
  // เพิ่มตัวเลือกใหม่สำหรับจัดการไฟล์ wallet
  if (process.argv.includes('--list-wallets')) {
    checkExistingWallets();
    return;
  }
  
  if (process.argv.includes('--clean-wallets')) {
    // หาจำนวนไฟล์ที่ต้องการเก็บจากพารามิเตอร์
    const keepIndex = process.argv.indexOf('--keep');
    const keepCount = keepIndex !== -1 && keepIndex + 1 < process.argv.length 
      ? parseInt(process.argv[keepIndex + 1]) 
      : 5; // ค่าเริ่มต้นคือเก็บ 5 ไฟล์ล่าสุด
      
    deleteOldWallets(keepCount);
    return;
  }

  // แสดงแบนเนอร์
  printBanner();
  
  console.log(colorText('\n=== Multichain Wallet Generator ===\n', Colors.BOLD + Colors.CYAN));
  
  try {
    const count = getValidWalletCount();
    const selectedChains = selectChain();
    
    let generateWithMnemonic;
    while (true) {
      const method = prompt(colorText('Generate with mnemonic phrases? (y/n, default: y): ', Colors.YELLOW)).toLowerCase() || 'y';
      if (method === 'y' || method === 'n') {
        generateWithMnemonic = method === 'y';
        break;
      }
      console.log(colorText('Please enter y or n.', Colors.RED));
    }
    
    console.log(colorText(`\nGenerating ${count} wallet${count > 1 ? 's' : ''} for each selected chain...`, Colors.GREEN));
    
    const wallets = [];
    let walletNumber = 1;
    
    for (const chainType of selectedChains) {
      for (let i = 0; i < count; i++) {
        try {
          const wallet = generateWithMnemonic 
            ? await generateWalletFromMnemonic(chainType) 
            : generateRandomWallet(chainType);
          wallets.push(wallet);
          
          console.log(colorText(`\n=== Wallet ${walletNumber} (${wallet.chain}) ===`, Colors.BOLD + Colors.CYAN));
          console.log(colorText(`Address: ${wallet.address}`, Colors.GREEN));
          
          if (wallet.chain === 'Solana') {
            console.log(colorText(`Base58 PrivateKey: ${wallet.privateKeyBase58}`, Colors.YELLOW));
            console.log(colorText(`PrivateKey (hex): ${wallet.privateKeyHex}`, Colors.YELLOW));
          } else {
            console.log(colorText(`PrivateKey: ${wallet.privateKey}`, Colors.YELLOW));
          }
          
          console.log(colorText(`Mnemonic: ${wallet.mnemonic}`, Colors.BLUE));
          
          walletNumber++;
        } catch (error) {
          console.error(colorText(`Error generating wallet for ${chainType}:`, Colors.RED), error);
          console.log(colorText('Skipping to next wallet...', Colors.RED));
        }
      }
    }
    
    if (wallets.length === 0) {
      console.log(colorText('No wallets were generated successfully.', Colors.RED));
      return;
    }
    
    // ตรวจสอบว่ามีไฟล์ wallet เดิมหรือไม่
    const existingFiles = checkExistingWallets(true); // ใช้ silent mode เพื่อไม่แสดงข้อความซ้ำซ้อน
    
    // เพียงแค่แจ้งให้ทราบว่ามีไฟล์เก่าอยู่ ไม่ถามลบ
    if (existingFiles.length > 0) {
      console.log(colorText(`\nNote: Found ${existingFiles.length} existing wallet file(s) in DATAwallet folder.`, Colors.CYAN));
      console.log(colorText(`To manage existing files, use: node index.js --list-wallets or --clean-wallets`, Colors.YELLOW));
    }

    let filePath = null;
    while (true) {
      const saveOption = prompt(colorText('\nDo you want to save these wallets to a js file? (y/n): ', Colors.YELLOW)).toLowerCase();
      if (saveOption === 'y' || saveOption === 'n') {
        if (saveOption === 'y') {
          filePath = saveToFile(wallets);
        }
        break;
      }
      console.log(colorText('Please enter y or n.', Colors.RED));
    }
    
    console.log(colorText('\nWallet generation complete!', Colors.GREEN + Colors.BOLD));
    
    if (filePath) {
      console.log(colorText(`\nIMPORTANT: Your wallet information is saved in:`, Colors.RED + Colors.BOLD));
      console.log(colorText(filePath, Colors.YELLOW));
      console.log(colorText('Keep this file secure and do not share it with anyone!', Colors.RED + Colors.BOLD));
      
      console.log(colorText('\nFile Management Tips:', Colors.CYAN + Colors.BOLD));
      console.log('• ' + colorText('View all wallet files:', Colors.CYAN) + ' ' + colorText('node index.js --list-wallets', Colors.YELLOW));
      console.log('• ' + colorText('Delete old files:', Colors.CYAN) + ' ' + colorText('node index.js --clean-wallets', Colors.YELLOW) + ' (keeps 5 most recent)');
      console.log('• ' + colorText('Keep specific number:', Colors.CYAN) + ' ' + colorText('node index.js --clean-wallets --keep 3', Colors.YELLOW));
      console.log('• ' + colorText('Delete ALL files:', Colors.CYAN) + ' ' + colorText('node index.js --clean-wallets --keep 0', Colors.YELLOW) + ' (use with caution)');
      
      if (existingFiles.length > 0) {
        console.log(colorText(`\nYou now have ${existingFiles.length + 1} wallet files in the DATAwallet folder.`, Colors.YELLOW));
      }
    }
  } catch (error) {
    console.error(colorText('An unexpected error occurred:', Colors.RED), error);
  }
}

main().catch(err => {
  console.error('An error occurred:', err);
}); 