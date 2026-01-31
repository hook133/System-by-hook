const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const coinsDataFile = path.join(__dirname, '..', config.coins.coinsDataFile);
let coinsData = {};

function loadCoinsData() {
  try {
    if (fs.existsSync(coinsDataFile)) {
      const rawData = fs.readFileSync(coinsDataFile, 'utf8');
      coinsData = JSON.parse(rawData);
      console.log('✅ تم تحميل بيانات العملات بنجاح');
    } else {
      console.log('📝 لم يتم العثور على ملف بيانات العملات - سيتم إنشاء ملف جديد');
      coinsData = {};
    }
  } catch (e) {
    console.error('❌ خطأ في تحميل بيانات العملات:', e);
    coinsData = {};
  }
}

function saveCoinsData() {
  try {
    fs.writeFileSync(coinsDataFile, JSON.stringify(coinsData, null, 2));
    console.log('💾 تم حفظ بيانات العملات بنجاح');
  } catch (e) {
    console.error('❌ خطأ في حفظ بيانات العملات:', e);
  }
}

function getUserCoins(userId) {
  if (!coinsData[userId]) {
    coinsData[userId] = {
      coins: 0,
      lastDaily: null
    };
  }
  return coinsData[userId];
}

function addCoins(userId, amount) {
  const userData = getUserCoins(userId);
  userData.coins += amount;
  saveCoinsData();
  return userData.coins;
}

function removeCoins(userId, amount) {
  const userData = getUserCoins(userId);
  if (userData.coins < amount) {
    return false;
  }
  userData.coins -= amount;
  saveCoinsData();
  return userData.coins;
}

function claimDaily(userId) {
  if (!config.coins.dailyRewardEnabled) {
    return { success: false, message: 'الهدية اليومية معطلة حالياً!' };
  }

  const userData = getUserCoins(userId);
  const now = new Date();
  const today = now.toDateString();

  if (userData.lastDaily === today) {
    return { success: false, message: 'لقد استلمت هديتك اليومية بالفعل! عد غداً.' };
  }

  userData.lastDaily = today;
  userData.coins += config.coins.dailyReward;
  saveCoinsData();

  return { success: true, coins: config.coins.dailyReward, total: userData.coins };
}

function canClaimDaily(userId) {
  const userData = getUserCoins(userId);
  const now = new Date();
  const today = now.toDateString();
  return userData.lastDaily !== today;
}

function getNextDailyTime(userId) {
  const userData = getUserCoins(userId);
  if (!userData.lastDaily) {
    return 'الآن';
  }

  const lastDaily = new Date(userData.lastDaily);
  const nextDaily = new Date(lastDaily);
  nextDaily.setDate(nextDaily.getDate() + 1);
  nextDaily.setHours(0, 0, 0, 0);

  const now = new Date();
  const diff = nextDaily - now;

  if (diff <= 0) {
    return 'الآن';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  } else {
    return `${minutes} دقيقة`;
  }
}

function getTopCoins(limit = 10) {
  const users = Object.entries(coinsData)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, limit);

  return users;
}

function resetCoins(userId) {
  if (coinsData[userId]) {
    delete coinsData[userId];
    saveCoinsData();
  }
}

function resetAllCoins() {
  coinsData = {};
  saveCoinsData();
}

module.exports = {
  loadCoinsData,
  saveCoinsData,
  getUserCoins,
  addCoins,
  removeCoins,
  claimDaily,
  canClaimDaily,
  getNextDailyTime,
  getTopCoins,
  resetCoins,
  resetAllCoins
};
