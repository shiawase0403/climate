export interface VegetationInfo {
  name: string; // 气候类型名称
  description: string; // 典型植被群落与生态特征
  species: string; // 关键物种/景观关键词
}

const VEGETATION_DB: Record<string, VegetationInfo> = {
  'Af': {
    name: '热带雨林气候',
    description: '热带雨林 (Tropical Rainforest) 具有复杂的垂直结构（通常4-5层），终年常绿。特征包括：板状根（支撑高大乔木）、老茎生花、丰富的附生植物（兰科、凤梨科）和绞杀植物（榕属）。无明显季节性节律。',
    species: '龙脑香科、榕树、藤本植物'
  },
  'Am': {
    name: '热带季雨林气候',
    description: '热带季雨林 (Tropical Monsoon Forest) 介于雨林与萨瓦纳之间。树冠层较雨林开阔，透光率高。具有季节性落叶特征（旱季落叶，雨季复苏），物种丰富度略低于Af。',
    species: '柚木 (Teak)、娑罗双、竹林'
  },
  'Aw': {
    name: '热带草原气候',
    description: '热带稀树草原 (Savanna) 呈“双层结构”：地面为连续的高草本层（C4植物为主），上层为稀疏、非连续的耐旱乔木/灌木层。沿河流发育走廊林 (Gallery Forest)。',
    species: '金合欢 (Acacia)、猴面包树 (Baobab)、桉树（澳）、象草'
  },
  'As': {
    name: '热带草原气候',
    description: '热带稀树草原 (Savanna) 呈“双层结构”：地面为连续的高草本层（C4植物为主），上层为稀疏、非连续的耐旱乔木/灌木层。沿河流发育走廊林 (Gallery Forest)。',
    species: '金合欢 (Acacia)、猴面包树 (Baobab)、桉树（澳）、象草'
  },
  'Cfa': {
    name: '亚热带湿润气候',
    description: '亚热带常绿阔叶林 (Evergreen Broad-leaved Forest) 东亚特称为照叶林 (Laurel Forest)。叶片革质、表面有光泽（角质层发达）以反射强光。林下灌木层发达。',
    species: '壳斗科（青冈、柯）、樟科、木兰科'
  },
  'Cwa': {
    name: '亚热带季风气候',
    description: '亚热带常绿与落叶混交林 因冬季干旱明显，相较于Cfa，乔木层中落叶树种比例增加。降水较少区可退化为灌草丛。',
    species: '樟树、枫香、马尾松、竹类'
  },
  'Cwb': {
    name: '亚热带高原气候',
    description: '山地常绿阔叶林 / 针阔混交林 分布于低纬度高原（如云贵高原、墨西哥高原）。气候如“恒春”，植被垂直分带明显，高处发育高山草甸。',
    species: '云南松、杜鹃花属 (Rhododendron)'
  },
  'Cwc': {
    name: '高原冷凉气候',
    description: '高山矮曲林 (Elfin Forest) / 帕拉莫植被 (Páramo) 乔木因低温和强风呈匍匐状或旗形树冠，向高山苔原过渡。',
    species: '禾本科草类、垫状植物'
  },
  'Cfb': {
    name: '温带海洋性气候',
    description: '温带落叶阔叶林（西欧典型） 但在降水极丰沛区（如北美PNW、新西兰、智利南部）发育温带雨林，以巨大针叶树和茂密蕨类为特征。',
    species: '山毛榉 (Beech)、栎属；（温带雨林：云杉、红杉、树蕨）'
  },
  'Cfc': {
    name: '副极地海洋气候',
    description: '亚极地针叶林 / 泥炭沼泽 树木生长低矮稀疏，地面常被泥炭藓覆盖，广泛发育草甸和湿地。',
    species: '桦树、云杉、泥炭藓'
  },
  'Csa': {
    name: '地中海气候（夏热）',
    description: '亚热带硬叶林 (Sclerophyllous Forest) 植物具有硬叶、深根、厚皮以适应夏季干旱。森林退化后形成马基群落 (Maquis) 或 加里格群落 (Garrigue)。',
    species: '油橄榄、软木塞栎、无花果、薰衣草'
  },
  'Csb': {
    name: '地中海气候（夏凉）',
    description: '硬叶林与针叶林混交 因夏季凉爽且多海雾（如加州沿岸），可生长极其高大的针叶树。灌木层称为查帕拉尔 (Chaparral)。',
    species: '红杉 (Redwood)、花旗松'
  },
  'Csc': {
    name: '地中海气候（寒冷）',
    description: '高山稀疏针叶林 极少见，位于Csb的高海拔延伸带，树木生长极其缓慢。',
    species: '布利斯托松 (Bristlecone Pine)'
  },
  'BWh': {
    name: '热带沙漠气候',
    description: '热带荒漠植被 以旱生植物 (Xerophytes)（仙人掌、多肉）和短命植物 (Ephemerals)（雨后迅速开花结籽）为主。',
    species: '仙人掌科、大戟科、柽柳'
  },
  'BWk': {
    name: '温带沙漠气候',
    description: '温带荒漠植被 灌木半灌木为主，耐寒耐旱。',
    species: '梭梭、白刺、沙拐枣'
  },
  'BSh': {
    name: '热带半干旱气候',
    description: '热带荒漠草原 (Steppe) 多刺灌丛与稀疏草本。',
    species: '灌木金合欢'
  },
  'BSk': {
    name: '温带半干旱气候',
    description: '温带典型草原 (Typical Steppe) 以旱生丛生禾草为主。降水较多处（森林草原过渡带）可生长落叶乔木。',
    species: '针茅 (Stipa)、羊草'
  },
  'Dfa': {
    name: '温带大陆/季风气候',
    description: '温带落叶阔叶林 (Deciduous Broad-leaved Forest) 四季分明，春季萌叶，秋季变色落叶。结构清晰（乔木-灌木-草本）。',
    species: '栎属 (Oak)、槭属 (Maple)、桦木、椴树'
  },
  'Dwa': {
    name: '温带大陆/季风气候',
    description: '温带落叶阔叶林 (Deciduous Broad-leaved Forest) 四季分明，春季萌叶，秋季变色落叶。结构清晰（乔木-灌木-草本）。',
    species: '栎属 (Oak)、槭属 (Maple)、桦木、椴树'
  },
  'Dfb': {
    name: '温带大陆/季风气候',
    description: '针阔混交林 (Mixed Forest) 落叶阔叶林向针叶林过渡的地带。',
    species: '红松、白桦、山杨'
  },
  'Dwb': {
    name: '温带大陆/季风气候',
    description: '针阔混交林 (Mixed Forest) 落叶阔叶林向针叶林过渡的地带。',
    species: '红松、白桦、山杨'
  },
  'Dfc': {
    name: '副极地气候',
    description: '暗亮针叶林 (Dark Taiga) 以常绿针叶树为主，树冠浓密，林下阴暗，地被为苔藓。土壤多为灰化土。',
    species: '云杉 (Spruce)、冷杉 (Fir)'
  },
  'Dwc': {
    name: '副极地气候',
    description: '暗亮针叶林 (Dark Taiga) 以常绿针叶树为主，树冠浓密，林下阴暗，地被为苔藓。土壤多为灰化土。',
    species: '云杉 (Spruce)、冷杉 (Fir)'
  },
  'Dfd': {
    name: '极地大陆性气候',
    description: '明亮针叶林 (Light Taiga) 因冬季极度严寒（-40℃以下），常绿树无法生存，仅落叶松能适应。树冠稀疏透光。',
    species: '落叶松 (Larch)'
  },
  'Dwd': {
    name: '极地大陆性气候',
    description: '明亮针叶林 (Light Taiga) 因冬季极度严寒（-40℃以下），常绿树无法生存，仅落叶松能适应。树冠稀疏透光。',
    species: '落叶松 (Larch)'
  },
  'Dsa': {
    name: '湿润大陆（夏干）',
    description: '耐旱山地针叶林 常见于高山垂直带，适应夏季干旱的针叶林，林下常见艾丛。',
    species: '黄松 (Ponderosa Pine)'
  },
  'Dsb': {
    name: '湿润大陆（夏干）',
    description: '耐旱山地针叶林 常见于高山垂直带，适应夏季干旱的针叶林，林下常见艾丛。',
    species: '黄松 (Ponderosa Pine)'
  },
  'ET': {
    name: '苔原气候',
    description: '苔原 (Tundra) 无乔木。植被紧贴地面生长以避风保暖。土壤下有永冻层。',
    species: '矮柳、地衣 (Lichen)、苔藓'
  },
  'EF': {
    name: '冰原气候',
    description: '寒漠 几乎无植被，仅在岩石裸露处偶见极地地衣或藻类。',
    species: '极地藻类'
  }
};

export const getVegetationInfo = (code: string | undefined): VegetationInfo | null => {
  if (!code) return null;
  return VEGETATION_DB[code] || null;
};
