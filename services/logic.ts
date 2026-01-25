/**
 * Climate Classification Algorithm (Modified Peel et al. 2007)
 * * 适用于 React / 前端调用的纯函数版本。
 */

/**
 * 核心分类函数
 * @param {number[]} temps - 12个月的平均气温 [Jan, Feb, ... Dec] (°C)
 * @param {number[]} precips - 12个月的降水量 [Jan, Feb, ... Dec] (mm)
 * @param {number} lat - 纬度 (用于判断南北半球季节)
 * @returns {string} 气候分类代码 (e.g., 'Af', 'Cwa', 'Dfb')
 */
export function getClimateClassification(temps: number[], precips: number[], lat: number): string {
  if (!temps || !precips || temps.length !== 12 || precips.length !== 12) {
    console.error("Error: Inputs must be arrays of length 12.");
    return "N/A";
  }

  // --- 1. 基础统计指标 ---
  const T_min = Math.min(...temps);
  const T_max = Math.max(...temps);
  // 年均温
  const T_ann = temps.reduce((a, b) => a + b, 0) / 12;
  // 年降水
  const P_ann = precips.reduce((a, b) => a + b, 0);
  // 最干月降水
  const P_min = Math.min(...precips);

  // --- 2. 季节性统计 (夏半年 vs 冬半年) ---
  // 定义：北半球夏天为 4月-9月 (Index 3-8)，冬天为 10月-3月
  // 南半球反之。
  
  let summerIndices: number[], winterIndices: number[];

  if (lat >= 0) {
    // 北半球
    summerIndices = [3, 4, 5, 6, 7, 8];
    winterIndices = [9, 10, 11, 0, 1, 2];
  } else {
    // 南半球 (季节互换)
    summerIndices = [9, 10, 11, 0, 1, 2];
    winterIndices = [3, 4, 5, 6, 7, 8];
  }

  const getStats = (indices: number[]) => {
    const vals = indices.map(i => precips[i]);
    return {
      max: Math.max(...vals),
      min: Math.min(...vals),
      sum: vals.reduce((a, b) => a + b, 0)
    };
  };

  const summerStats = getStats(summerIndices);
  const winterStats = getStats(winterIndices);

  const P_smax = summerStats.max;
  const P_smin = summerStats.min;
  const P_ssum = summerStats.sum;

  const P_wmax = winterStats.max;
  const P_wmin = winterStats.min;
  const P_wsum = winterStats.sum;

  // --- 3. 计算干燥阈值 P_th ---
  // 逻辑参考 Koeppen-Geiger (Peel et al. 2007)
  const P_wpro = P_wsum / P_ann; // 冬季降水占比
  const P_spro = P_ssum / P_ann; // 夏季降水占比

  let P_th;
  if (P_wpro >= 2/3) {
    // 冬雨型 (如地中海)
    P_th = 2 * T_ann;
  } else if (P_spro >= 2/3) {
    // 夏雨型 (如季风)
    P_th = 2 * T_ann + 28;
  } else {
    // 均匀型
    P_th = 2 * T_ann + 14;
  }
  
  // 确保阈值非负（极寒地区可能出现 T_ann 为负导致异常）
  // 但标准公式中通常 P_th 随 T_ann 变化。这里保持原算法逻辑，不做额外非负截断，除非 P_ann 极小。

  // --- 4. 决策树逻辑 ---

  // Group E: 极地气候
  if (T_max < 10) {
    return T_max >= 0 ? "ET" : "EF";
  }

  // Group B: 干旱气候
  if (P_ann < 10 * P_th) {
    let code = P_ann > 5 * P_th ? "BS" : "BW";
    code += T_ann >= 18 ? "h" : "k";
    return code;
  }

  // Group A: 热带气候
  if (T_min >= 18) {
    if (P_min > 60) return "Af";
    if (P_ann >= 25 * (100 - P_min)) return "Am";
    // 区分 Aw (萨凡纳-冬干) 和 As (萨凡纳-夏干)
    // 通常 Aw 更常见，判据是 P_smin <= 60 or P_wmin <= 60
    // Peel 标准：
    return P_min <= 60 ? "Aw" : "Af"; // 简化判定，通常 Aw 覆盖 As
  }

  // Group C (温带) & D (大陆)
  // 辅助函数：判断第二位字母 (w, s, f)
  // *** 这里应用了你的自定义修改 ***
  const getSecondLetter = () => {
    // 1. 优先判定 w (夏雨型 / 冬干)
    // 修改后的标准：夏季最大值 >= 冬季最小值 * 10 且 夏季总量 > 冬季总量
    if (P_smax >= 10 * P_wmin && P_ssum > P_wsum) {
      return "w";
    }
    
    // 2. 判定 s (冬雨型 / 夏干)
    // Peel 标准：夏季最小 < 冬季最小 且 冬季最大 > 3 * 夏季最小 且 夏季最小 < 40
    if (P_smin < P_wmin && P_wmax > 3 * P_smin && P_smin < 40) {
      return "s";
    }

    // 3. 默认 f (湿润)
    return "f";
  };

  // 辅助函数：判断第三位字母 (a, b, c, d)
  const getThirdLetter = () => {
    if (T_max >= 22) return "a";
    
    // 统计超过 10度 的月数
    const monthsAbove10 = temps.filter(t => t > 10).length;
    
    if (monthsAbove10 >= 4) return "b";
    if (T_min > -38) return "c";
    return "d";
  };

  const second = getSecondLetter();
  const third = getThirdLetter();

  // Group C: 温带
  if (T_min > 0 && T_min < 18) {
    return "C" + second + third;
  }

  // Group D: 大陆性 (寒温带)
  if (T_min <= 0 && T_max >= 10) {
    return "D" + second + third;
  }

  // 兜底 (理论上不会走到这里，除非数据异常)
  return "N/A";
}
