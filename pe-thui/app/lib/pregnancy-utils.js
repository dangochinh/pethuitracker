export function calculatePregnancyWeeks(eddString) {
    const edd = new Date(eddString);
    const today = new Date();
    
    // Conception is typically 280 days (40 weeks) before EDD
    const conceptionDate = new Date(edd.getTime() - 280 * 24 * 60 * 60 * 1000);
    
    const diffTime = Math.abs(today - conceptionDate);
    const totalDaysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If today is past EDD, just cap it at 40 weeks or handle post-term
    const cappedDays = Math.min(totalDaysPassed, 294); // cap at 42 weeks
    
    const weeks = Math.floor(cappedDays / 7);
    const days = cappedDays % 7;
    
    const daysRemaining = Math.max(0, 280 - totalDaysPassed);
    
    let trimester = 1;
    if (weeks >= 13 && weeks <= 26) trimester = 2;
    if (weeks >= 27) trimester = 3;

    // Very rough estimates for fruit size, weight, length
    const fruitMap = {
        4: { name: 'Hạt tiêu', emoji: '🌑', weight: 0.1, length: 0.2 },
        5: { name: 'Hạt vừng', emoji: '🌱', weight: 0.1, length: 0.3 },
        6: { name: 'Đậu lăng', emoji: '🥜', weight: 0.2, length: 0.6 },
        7: { name: 'Quả việt quất', emoji: '🫐', weight: 0.5, length: 1.3 },
        8: { name: 'Quả mâm xôi', emoji: '🍇', weight: 1, length: 1.6 },
        9: { name: 'Quả nho', emoji: '🍇', weight: 2, length: 2.3 },
        10: { name: 'Quả quất', emoji: '🍊', weight: 4, length: 3.1 },
        11: { name: 'Quả sung', emoji: '🌰', weight: 7, length: 4.1 },
        12: { name: 'Quả chanh ta', emoji: '🍋', weight: 14, length: 5.4 },
        13: { name: 'Quả chanh tây', emoji: '🍋', weight: 23, length: 7.4 },
        14: { name: 'Quả đào', emoji: '🍑', weight: 43, length: 8.7 },
        15: { name: 'Quả táo', emoji: '🍎', weight: 70, length: 10.1 },
        16: { name: 'Quả bơ', emoji: '🥑', weight: 100, length: 11.6 },
        17: { name: 'Củ hành tây', emoji: '🧅', weight: 140, length: 13.0 },
        18: { name: 'Quả ớt chuông', emoji: '🫑', weight: 190, length: 14.2 },
        19: { name: 'Quả cà chua heirloom', emoji: '🍅', weight: 240, length: 15.3 },
        20: { name: 'Quả chuối', emoji: '🍌', weight: 300, length: 16.4 },
        21: { name: 'Củ cà rốt', emoji: '🥕', weight: 360, length: 26.7 }, // length measured head to heel from here
        22: { name: 'Quả đu đủ nhỏ', emoji: '🍈', weight: 430, length: 27.8 },
        23: { name: 'Quả xoài lớn', emoji: '🥭', weight: 501, length: 28.9 },
        24: { name: 'Bắp ngô', emoji: '🌽', weight: 600, length: 30.0 },
        25: { name: 'Củ cải', emoji: '🍠', weight: 660, length: 34.6 },
        26: { name: 'Cây hành lá', emoji: '🥬', weight: 760, length: 35.6 },
        27: { name: 'Cái súp lơ', emoji: '🥦', weight: 875, length: 36.6 },
        28: { name: 'Quả cà tím lớn', emoji: '🍆', weight: 1005, length: 37.6 },
        29: { name: 'Bí hồ lô', emoji: '🥒', weight: 1153, length: 38.6 },
        30: { name: 'Bắp cải lớn', emoji: '🥬', weight: 1319, length: 39.9 },
        31: { name: 'Quả dừa', emoji: '🥥', weight: 1502, length: 41.1 },
        32: { name: 'Củ sắn', emoji: '🍠', weight: 1702, length: 42.4 },
        33: { name: 'Quả khóm (Dứa)', emoji: '🍍', weight: 1918, length: 43.7 },
        34: { name: 'Quả dưa vàng', emoji: '🍈', weight: 2146, length: 45.0 },
        35: { name: 'Quả dưa lê', emoji: '🍈', weight: 2383, length: 46.2 },
        36: { name: 'Quả đu đủ lớn', emoji: '🍈', weight: 2622, length: 47.4 },
        37: { name: 'Cây cải thảo', emoji: '🥬', weight: 2859, length: 48.6 },
        38: { name: 'Quả dưa hấu nhỏ', emoji: '🍉', weight: 3083, length: 49.8 },
        39: { name: 'Quả bí ngô nhỏ', emoji: '🎃', weight: 3288, length: 50.7 },
        40: { name: 'Quả dưa hấu', emoji: '🍉', weight: 3462, length: 51.2 },
        41: { name: 'Quả mít nhỏ', emoji: '🍈', weight: 3597, length: 51.7 },
        42: { name: 'Quả mít', emoji: '🍈', weight: 3685, length: 51.5 },
    };

    const w = Math.min(Math.max(weeks, 4), 42); // cap between 4 and 42 for lookup
    const fruit = fruitMap[w] || fruitMap[4];

    return {
        weeks,
        days,
        totalDaysPassed,
        daysRemaining,
        trimester,
        fruitName: fruit.name,
        fruitEmoji: fruit.emoji,
        estimatedWeight: fruit.weight,
        estimatedLength: fruit.length
    };
}
