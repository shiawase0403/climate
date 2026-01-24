import { ClimateCategory } from '../types';

export const EXPLORE_DATA: ClimateCategory[] = [
  {
    code: 'Af',
    title: '热带雨林气候 (Tropical Rainforest)',
    cities: [
      {
        name: 'Singapore (新加坡)',
        country: 'Singapore',
        lat: 1.2833,
        lng: 103.8500,
        description: '新加坡位于马来半岛南端，距离赤道仅约137公里，是全球典型的热带雨林气候代表。由于地处赤道无风带，这里受东北季风和西南季风的双重影响，但无论风向如何，经过温暖海洋的气流都带来了极其充沛的水汽。新加坡几乎没有气旋活动（科里奥利力过弱），其降水主要源自午后的热对流雷暴（Sumatra Squalls）。城市化的热岛效应进一步加剧了云层的生成与降水频率。'
      },
      {
        name: 'Kuala Lumpur (吉隆坡)',
        country: 'Malaysia',
        lat: 3.1333,
        lng: 101.6833,
        description: '位于蒂迪旺沙山脉西侧的巴生谷地。尽管山脉在一定程度上阻挡了部分季风，但吉隆坡依然维持着热带雨林气候特征。其降水高峰通常出现在季风转换期（4月和10月），这种双峰型降水模式是赤道地区太阳直射点每年两次经过该纬度导致赤道低气压带经过的直接体现。'
      },
      {
        name: 'Ishigaki (石垣)',
        country: 'Japan',
        lat: 24.3333,
        lng: 124.1500,
        description: '石垣岛是热带雨林气候的一个显著“高纬度异常”。虽然位于北回归线附近的副热带区域；但受强暖流——黑潮（Kuroshio Current）的影响，加之夏季频繁的台风活动和冬季东北季风经过温暖海面形成气团，使得该岛依然能维持热带雨林所需的降水量和温度，突破了纬度的限制。'
      },
      {
        name: 'Kampala (坎帕拉)',
        country: 'Uganda',
        lat: 0.3000,
        lng: 32.5667,
        description: '坎帕拉代表了“高地热带雨林”气候。虽然紧邻赤道，但其平均海拔超过1100米，这使得气温较同纬度的海平面城市（如新加坡）温和。维多利亚湖（Lake Victoria）巨大的水体提供了局地水汽循环，形成的湖陆风效应确保了全年的高湿度 and 降水，使其符合Af标准。'
      },
      {
        name: 'Honiara (霍尼亚拉)',
        country: 'Solomon Islands',
        lat: -9.4333,
        lng: 159.9500,
        description: '位于瓜达尔卡纳尔岛北岸。这里是南太平洋辐合带（SPCZ）活跃的区域。除了季风影响外，热带气旋的生成也为该地区带来了极端的降水事件。作为一个群岛城市，其气候具有极强的海洋性，日温差极小。'
      },
      {
        name: 'Apia (阿皮亚)',
        country: 'Samoa',
        lat: -13.8333,
        lng: -171.7500,
        description: '位于乌波卢岛北岸，直面盛行的东南信风。虽然处于南半球信风带，但由于海洋广阔且水温高，信风在此处并非带来干燥，而是携带了大量水汽。山脉的阻挡在迎风坡形成了持续的降雨，使阿皮亚保持着典型的雨林气候特征。'
      },
      {
        name: 'Paramaribo (帕拉马里博)',
        country: 'Suriname',
        lat: 5.8667,
        lng: -55.1667,
        description: '位于南美洲东北部的圭亚那地盾边缘。这里受北大西洋信风带的控制，且由于亚马逊雨林的蒸腾作用提供了背景湿度，使得该区域全年湿润。赤道低气压带的南北移动虽然带来降水波动，但即使在“干季”降水也依然丰富。'
      },
      {
        name: 'Georgetown (乔治敦)',
        country: 'Guyana',
        lat: 6.8000,
        lng: -58.1500,
        description: '与帕拉马里博类似，乔治敦位于低洼的沿海平原，直接暴露在潮湿的东北信风之下。这一地区实际上有两个雨季（5-8月，11-1月），分别对应赤道低气压带的北进和南退，这种双雨季模式消除了形成显著长干季的可能性。'
      }
    ]
  },
  {
    code: 'Am',
    title: '热带季风气候 (Tropical Monsoon)',
    cities: [
      {
        name: 'Malé (马累)',
        country: 'Maldives',
        lat: 4.1667,
        lng: 73.5000,
        description: '位于印度洋中心的环礁之上。虽然四面环海，但受南亚季风系统的强烈控制。冬季盛行干燥的东北季风，夏季盛行湿润的西南季风。由于岛屿面积过小，无法形成局地热对流降水，因此降水高度依赖于大尺度季风气流的辐合。'
      },
      {
        name: 'Freetown (弗里敦)',
        country: 'Sierra Leone',
        lat: 8.4833,
        lng: -13.2333,
        description: '弗里敦拥有全球最剧烈的季风降水之一。夏季，来自大西洋的西南季风几乎垂直撞击西非海岸的山地（狮子山），产生惊人的地形雨。而在冬季，来自撒哈拉沙漠的哈马丹风（Harmattan）（来自大陆的信风）虽然被地形削弱，但仍带来明显的干旱期。'
      },
      {
        name: 'Malabo (马拉博)',
        country: 'Equatorial Guinea',
        lat: 3.7500,
        lng: 8.7667,
        description: '位于比奥科岛北端。该岛也是火山岛，其地理位置使其拦截了随几内亚季风北上的大量水汽。作为非洲最湿润的地区之一，其干季非常短暂，几乎处于Af与Am的临界点。'
      },
      {
        name: 'Cairns (凯恩斯)',
        country: 'Australia',
        lat: -16.9167,
        lng: 145.7667,
        description: '凯恩斯位于昆士兰热带海岸，背靠大分水岭。这里是“信风季风”气候的典范。夏季受热带低压和季风槽影响多雨；冬季盛行东南信风，虽然信风来自海洋，但对于凯恩斯以北地区，信风在经过大堡礁和珊瑚海后携带水汽，在遇到地形抬升时仍能降雨，从而缓解了干季的强度，使其维持雨林景观。'
      },
      {
        name: 'Miami (迈阿密)',
        country: 'United States',
        lat: 25.7667,
        lng: -80.1833,
        description: '迈阿密的气候属于“信风岸”型季风气候。虽然纬度较高，但墨西哥湾暖流（Gulf Stream）的存在使其冬季异常温暖。夏季降水主要源自热力对流和热带波动（包括飓风），冬季则相对干燥，但偶尔受锋面系统扫尾影响，不会完全干透。'
      },
      {
        name: 'Recife (累西腓)',
        country: 'Brazil',
        lat: -8.0500,
        lng: -34.8667,
        description: '位于巴西东北角的突出部。这里受东风波（Easterly Waves）扰动影响显著，降水集中在南半球的“冬季”（实际上是高日照后的滞后降水期）。信风将大西洋的湿气直接输送至此，使得即便在所谓的干季，空气湿度也极高。'
      },
      {
        name: 'Puerto Ayacucho (阿亚库乔港)',
        country: 'Venezuela',
        lat: 5.6500,
        lng: -67.6167,
        description: '位于奥里诺科河畔，地处亚马逊雨林与北部大草原（Llanos）的过渡带。这里深受赤道低气压带季节性摆动的影响，当其北移时带来暴雨，南移时则受副热带高压边缘和信风控制进入干季。'
      }
    ]
  },
  {
    code: 'Aw',
    title: '热带稀树草原气候 (Tropical Savanna - Winter Dry)',
    cities: [
      {
        name: 'Maputo (马普托)',
        country: 'Mozambique',
        lat: -25.9667,
        lng: 32.5667,
        description: '位于回归线附近。受厄加勒斯暖流（Agulhas Current）影响，沿岸相对湿润。但冬季受南非高原上的反气旋控制，气流下沉，形成干季。'
      },
      {
        name: 'Lagos (拉各斯)',
        country: 'Nigeria',
        lat: 6.4500,
        lng: 3.3833,
        description: '这是一个特殊的Aw案例。拉各斯距离赤道很近，本应是Af，但由于几内亚湾沿岸存在一股季节性的冷升流，加之海岸线平行于西南季风，减少了抬升，导致在8月份出现一个显著的“小干季”（Little Dry Season），使其年总降水量和分布形态符合Aw标准。'
      },
      {
        name: 'Darwin (达尔文)',
        country: 'Australia',
        lat: -12.4500,
        lng: 130.8333,
        description: '澳大利亚北部的典型代表。冬季，澳大利亚大陆形成强大的高压中心，向外吹出极为干燥的东南信风，达尔文随之进入数月的无雨期，草木枯黄，易发火灾。夏季季风爆发时，降水强度极大。'
      },
      {
        name: 'Port of Spain (西班牙港)',
        country: 'Trinidad and Tobago',
        lat: 10.6500,
        lng: -61.5000,
        description: '位于飓风带边缘。虽然海洋性强，但受副热带高压季节性南扩影响，前半年（1-5月）有明显的干季，符合Aw特征。'
      },
      {
        name: 'Panama City (巴拿马城)',
        country: 'Panama',
        lat: 8.9833,
        lng: -79.5167,
        description: '巴拿马城位于太平洋一侧。虽然巴拿马地峡狭窄，但中央山脉足以阻挡冬季（北半球）盛行的东北信风中的水汽，导致太平洋一侧出现明显的雨影区干季，而仅80公里外的大西洋一侧（科隆）则是Af气候。'
      },
      {
        name: 'Barranquilla (巴兰基亚)',
        country: 'Colombia',
        lat: 10.9500,
        lng: -74.7833,
        description: '位于哥伦比亚加勒比海岸。受加勒比低空急流的影响，干季风力强劲且极度干燥。赤道低压带南移后，该地完全暴露在干燥的东北信风下。'
      }
    ]
  },
  {
    code: 'As',
    title: '热带稀树草原气候 (Summer Dry)',
    cities: [
      {
        name: 'São Tomé (圣多美)',
        country: 'São Tomé and Príncipe',
        lat: 0.3333,
        lng: 6.7333,
        description: '位于赤道几内亚湾。虽然在赤道上，但受本格拉寒流（Benguela Current）北延的影响，且位于喀麦隆火山线的背风侧，导致在南半球冬季（当地旱季）异常干燥，而这个旱季在某些年份会延伸，造成复杂的降水模式。'
      },
      {
        name: 'Mombasa (蒙巴萨)',
        country: 'Kenya',
        lat: -4.0500,
        lng: 39.6667,
        description: '东非海岸的特殊性在于，盛行季风往往平行于海岸线吹拂（冬季东北风，夏季西南风），导致水汽难以登陆抬升。此外，索马里寒流在夏季的出现稳定了大气，抑制了深对流，使得夏季降水反而不如过渡季多。'
      },
      {
        name: 'Fortaleza (福塔莱萨)',
        country: 'Brazil',
        lat: -3.7167,
        lng: -38.5333,
        description: '巴西东北部的“干旱角”。虽然靠海，但海岸线走向与东南信风平行，且南部的博尔博雷马高原阻挡了水汽。赤道低压带在此处的移动幅度导致其降水集中在年初，而下半年（包括夏季部分时间）极其干燥。'
      }
    ]
  },
  {
    code: 'BWh',
    title: '热带沙漠气候 (Hot Desert)',
    cities: [
      {
        name: 'Doha (多哈)',
        country: 'Qatar',
        lat: 25.2833,
        lng: 51.5333,
        description: '典型的波斯湾沙漠气候。虽然临海，湿度极高（闷热），但由于高空受副热带高压强力控制，气流下沉增温，极难成云致雨。夏季气温常破45°C，是地球上人类居住环境最恶劣的地区之一。'
      },
      {
        name: 'Mecca (麦加)',
        country: 'Saudi Arabia',
        lat: 21.4167,
        lng: 39.8167,
        description: '位于内陆山谷中，周围群山环绕导致热量不易散发。作为红海沿岸的腹地，距离海洋的水汽太远，且完全处于哈德莱环流的下沉区，全年几乎无雨。'
      },
      {
        name: 'Almería (阿尔梅里亚)',
        country: 'Spain',
        lat: 36.8333,
        lng: -2.4500,
        description: '欧洲大陆唯一的BWh气候区。位于伊比利亚半岛东南角，内华达山脉（Sierra Nevada）阻挡了来自大西洋的湿润气流，且来自非洲的干热气流常年控制此地，使其成为欧洲的“好莱坞西部片”取景地。'
      },
      {
        name: 'Cairo (开罗)',
        country: 'Egypt',
        lat: 30.0333,
        lng: 31.2333,
        description: '尼罗河三角洲顶端。开罗的存在完全依赖于尼罗河这一客河。虽然地中海气旋偶尔会在冬季带来零星降雨，但撒哈拉沙漠的干燥背景占据绝对主导。'
      },
      {
        name: 'Nouakchott (努瓦克肖特)',
        country: 'Mauritania',
        lat: 18.0833,
        lng: -15.9667,
        description: '沿海沙漠的代表。加那利寒流（Canary Current）流经沿岸，导致多雾但少雨。寒流冷却了下层大气，造成逆温层，阻止了对流雨的形成，即便空气相对湿度较高。'
      },
      {
        name: 'Alice Springs (爱丽斯斯普林斯)',
        country: 'Australia',
        lat: -23.7000,
        lng: 133.8667,
        description: '澳大利亚大陆的地理中心。这里是绝对的大陆性气候，距离任何海洋都超过1000公里。降水完全取决于偶尔深入内陆的热带低压残余。'
      },
      {
        name: 'Las Vegas (拉斯维加斯)',
        country: 'United States',
        lat: 36.1667,
        lng: -115.1333,
        description: '位于莫哈韦沙漠（Mojave Desert）。其干燥主要归因于雨影效应：西侧巍峨的内华达山脉（Sierra Nevada）拦截了几乎所有来自太平洋的水汽。'
      },
      {
        name: 'Lima (利马)',
        country: 'Peru',
        lat: -12.0333,
        lng: -77.0333,
        description: '全球最奇特的沙漠城市之一，凉爽多雾，全年湿度高，虽然纬度低，但秘鲁寒流（Humboldt Current）极强，导致气温异常偏低（最热月仅26°C左右）。寒流造成极其稳定的逆温层，不仅无雨，反而终年被厚厚的层云覆盖，形成了“无雨之湿地”。'
      }
    ]
  },
  {
    code: 'BWk',
    title: '温带沙漠气候 (Cold Desert)',
    cities: [
      {
        name: 'Turpan (吐鲁番)',
        country: 'China',
        lat: 42.9500,
        lng: 89.1667,
        description: '位于欧亚大陆腹地的吐鲁番盆地，是中国的热极和旱极。盆地地形闭塞，海拔低于海平面，增温效应显著，但冬季受西伯利亚高压控制，气温骤降至冰点以下，年温差极大。'
      },
      {
        name: 'Golmud (格尔木)',
        country: 'China',
        lat: 36.4072,
        lng: 94.9283,
        description: '位于柴达木盆地，距海极为遥远，地形封闭，水汽几乎无法抵达，高寒干旱。'
      },
      {
        name: 'Aqtau (阿克套)',
        country: 'Qazaqstan',
        lat: 43.6525,
        lng: 51.1575,
        description: '虽有里海调节，但是夏季高温仍可达到45℃以上，位于中亚内陆，水汽大多被西部大高加索山脉拦截，降水稀少。'
      }
    ]
  },
  {
    code: 'BSh',
    title: '热带半干旱气候 (Hot Steppe)',
    cities: [
      {
        name: 'New Delhi (新德里)',
        country: 'India',
        lat: 28.5893,
        lng: 77.2119,
        description: '降水非常集中，雨季多暴雨，干季很长，在暖湿的西南季风到来前会形成热季，气温极易上升至45℃左右，导致其成为地球上最不宜居的城市之一。'
      },
      {
        name: 'Alicante (阿利坎特)',
        country: 'Spain',
        lat: 38.3333,
        lng: -0.4833,
        description: '贝蒂科山脉的雨影区。虽然临海，但降水稀少，且夏季极度干热。'
      },
      {
        name: 'Nicosia (尼科西亚)',
        country: 'Cyprus',
        lat: 35.1667,
        lng: 33.3500,
        description: '位于岛屿中部的梅萨奥里亚平原。南北两侧的山脉（特罗多斯山和凯里尼亚山）拦截了大部分海风水汽，形成局部干旱中心。'
      },
      {
        name: 'Niamey (尼亚美)',
        country: 'Niger',
        lat: 13.5000,
        lng: 2.1167,
        description: '典型的萨赫勒（Sahel）气候。处于撒哈拉沙漠南缘，生态系统极不稳定，完全依赖夏季短暂的西非季风降雨，干旱年份极易导致荒漠化。'
      },
      {
        name: 'Ouagadougou (瓦加杜古)',
        country: 'Burkina Faso',
        lat: 12.3667,
        lng: -1.5167,
        description: '同属萨赫勒带。降水变率大，蒸发强烈。'
      },
      {
        name: 'Monterrey (蒙特雷)',
        country: 'Mexico',
        lat: 25.6667,
        lng: -100.3000,
        description: '位于东马德雷山脉的雨影区。虽然靠近墨西哥湾，但地形效应显著减少了降水。'
      },
      {
        name: 'Maracaibo (马拉开波)',
        country: 'Venezuela',
        lat: 10.6333,
        lng: -71.6333,
        description: '位于马拉开波湖盆地。盆地下沉气流加上强烈的日照蒸发，使得这里异常干热，尽管湖水提供了湿度，但难以降雨。'
      },
      {
        name: 'Petrolina (佩特罗里纳)',
        country: 'Brazil',
        lat: -9.3833,
        lng: -40.5000,
        description: '位于巴西东北部的“干旱多边形”腹地。大西洋水汽难以到达此地，且该区域大气层结常年稳定。'
      },
      {
        name: 'Yuanjiang (元江)',
        country: 'China',
        lat: 23.5961,
        lng: 101.9981,
        description: '典型"干热河谷"，常出现40℃高温'
      }
    ]
  },
  {
    code: 'BSk',
    title: '温带半干旱气候 (Cold Steppe)',
    cities: [
      {
        name: 'Astrakhan (阿斯特拉罕)',
        country: 'Russia',
        lat: 46.3500,
        lng: 48.0333,
        description: '位于伏尔加河三角洲，里海低地。极端的大陆性气候，冬冷夏热，降水极少，周围是荒漠草原。'
      },
      {
        name: 'Zaragoza (萨拉戈萨)',
        country: 'Spain',
        lat: 41.6500,
        lng: -0.8667,
        description: '位于埃布罗河谷。北有比利牛斯山，南有伊比利亚系山脉，双重屏障造就了西班牙内陆著名的干旱带。'
      },
      {
        name: 'Lanzhou (兰州)',
        country: 'China',
        lat: 36.0611,
        lng: 103.8319,
        description: '标准的温带半干旱气候，距海遥远，季风较难抵达，降水集中在夏季。'
      }
    ]
  },
  {
    code: 'Csa',
    title: '热夏型地中海气候 (Hot-summer Mediterranean)',
    cities: [
      {
        name: 'Jerusalem (耶路撒冷)',
        country: 'Israel/Palestine',
        lat: 31.7833,
        lng: 35.2167,
        description: '夏季受副高控制，完全无雨且酷热；冬季西风槽带来降水，高海拔偶致降雪。'
      },
      {
        name: 'Tashkent (塔什干)',
        country: 'Uzbekistan',
        lat: 41.2667,
        lng: 69.2667,
        description: '大陆性地中海气候。深居中亚内陆，夏季干热源自大陆气团的控制；冬季虽冷，但主要降水仍来自西风带输送的地中海/大西洋水汽残余，故降水形态符合Cs标准。'
      },
      {
        name: 'Rome (罗马)',
        country: 'Italy',
        lat: 41.8833,
        lng: 12.4833,
        description: '地中海气候的模式标本。第勒尼安海调节了极端温度，但夏季依然受到来自北非高压脊的影响，炎热少雨。'
      },
      {
        name: 'Split (斯普利特)',
        country: 'Croatia',
        lat: 43.5000,
        lng: 16.4333,
        description: '亚得里亚海东岸。迪纳拉山脉紧邻海岸，不仅造就了壮丽景观，也通过地形抬升增强了冬季的气旋雨，使其比意大利同纬度地区更湿润。'
      },
      {
        name: 'Algiers (阿尔及尔)',
        country: 'Algeria',
        lat: 36.7667,
        lng: 3.0500,
        description: '北非沿岸。阿特拉斯山脉阻挡了撒哈拉的热浪，使沿海维持Csa气候，而山后即是沙漠。'
      },
      {
        name: 'Tangier (丹吉尔)',
        country: 'Morocco',
        lat: 35.7667,
        lng: -5.8000,
        description: '直布罗陀海峡南岸。大西洋和地中海气候的交汇点，风力强劲。'
      },
      {
        name: 'Los Angeles (洛杉矶)',
        country: 'United States',
        lat: 34.0500,
        lng: -118.2500,
        description: '北美Csa代表。加利福尼亚寒流虽强，但大洛杉矶盆地的地形闭塞效应导致夏季热量聚集（尤其在内陆山谷），使其整体归为Csa而非Csb。'
      },
      {
        name: 'Sacramento (萨克拉门托)',
        country: 'United States',
        lat: 38.5667,
        lng: -121.4833,
        description: '加州中央谷地。虽然纬度比旧金山高，但由于海岸山脉阻挡了海风，夏季酷热难耐，是典型的内陆型Csa。'
      },
      {
        name: 'Athens (雅典)',
        country: 'Greece',
        lat: 37.9700,
        lng: 23.7200,
        description: '更低纬度的Csa，降水模式更为典型'
      }
    ]
  },
  {
    code: 'Csb',
    title: '凉夏型地中海气候 (Warm-summer Mediterranean)',
    cities: [
      {
        name: 'Perth (珀斯)',
        country: 'Australia',
        lat: -31.9500,
        lng: 115.8500,
        description: '全球季节反差最强烈的地中海气候之一，处于Csa/Csb过渡。夏季较炎热，冬季西风带带来的锋面雨则非常集中。'
      },
      {
        name: 'Porto (波尔图)',
        country: 'Portugal',
        lat: 41.1500,
        lng: -8.6167,
        description: '位于伊比利亚半岛西北角。直面大西洋，深受加那利寒流前身的影响，夏季凉爽，冬季多雨且潮湿。'
      },
      {
        name: 'Cape Town (开普敦)',
        country: 'South Africa',
        lat: -33.9167,
        lng: 18.4167,
        description: '典型的Csb。本格拉寒流（Benguela Current）极其强劲，不仅带来了丰富的渔业资源，也像天然空调一样冷却了夏季的桌山脚下。'
      },
      {
        name: 'San Francisco (旧金山)',
        country: 'United States',
        lat: 37.7667,
        lng: -122.4167,
        description: '全球最著名的Csb城市。加利福尼亚寒流与内陆热低压共同作用形成了著名的夏季海雾（Advection Fog）。这使得旧金山的夏季异常寒冷（“马克·吐温最冷的冬天是旧金山的夏天”），气温常徘徊在15-20°C，完全不同于仅百公里外的萨克拉门托。'
      }
    ]
  },
  {
    code: 'Cfa',
    title: '亚热带季风和亚热带湿润气候 (Humid Subtropical)',
    cities: [
      {
        name: 'Changsha (长沙)',
        country: 'China',
        lat: 28.1833,
        lng: 112.9667,
        description: '南支槽与地形锋面： 冬季受西风在青藏高原分流的南支西风槽引导，印度洋暖湿气流与西伯利亚冷空气在湘江流域形成准静止锋，导致持续阴雨和冻雨。夏季受副高控制。'
      },
      {
        name: 'Buenos Aires (布宜诺斯艾米斯)',
        country: 'Argentina',
        lat: -34.6000,
        lng: -58.3667,
        description: '南大西洋高压与沿岸低压形成强气压梯度，驱动东南风，夏季受大陆热低压吸引，大西洋水汽深入形成对流雨。'
      },
      {
        name: 'Sochi (索契)',
        country: 'Russia',
        lat: 43.5833,
        lng: 39.7167,
        description: '俄罗斯气候最为暖湿的地区，大高加索山脉阻挡寒潮南下，黑海提供冬季热源和水汽，西风控制，地形抬升造成高纬度罕见的暖湿多雨气候。'
      },
      {
        name: 'Atlanta (亚特兰大)',
        country: 'United States',
        lat: 33.7500,
        lng: -84.3833,
        description: '典型的亚热带季风性湿润气候，夏季墨西哥湾暖湿气流北上提供不稳定能量，冬季受锋面气旋影响。'
      },
      {
        name: 'Taipei (台北)',
        country: 'China',
        lat: 25.0375,
        lng: 121.5625,
        description: '夏季受东南季风和台风影响，冬季有冷湿的偏北风带来阴雨'
      }
    ]
  },
  {
    code: 'Cwa',
    title: '亚热带季风和亚热带湿润气候 (Monsoon-influenced Humid Subtropical)',
    cities: [
      {
        name: 'Hong Kong (香港)',
        country: 'China',
        lat: 22.2833,
        lng: 114.1667,
        description: '东亚季风： 冬季受西伯利亚高压控制，盛行干冷季风；夏季受副高及季风槽影响，盛行东南与西南季风，台风叠加增强降水。'
      },
      {
        name: 'Islamabad (伊斯兰堡)',
        country: 'Pakistan',
        lat: 33.7000,
        lng: 73.0667,
        description: '双重降水机制： 夏季受南亚季风迎坡抬升影响致洪；冬季受西风带中的西方扰动（Western Disturbances）影响，从阿拉伯海输送水汽产生降雨。'
      },
      {
        name: 'Pretoria (比勒陀利亚)',
        country: 'South Africa',
        lat: -25.7500,
        lng: 28.1833,
        description: '副热带高压带摆动： 冬季卡拉哈里高压控制导致强下沉逆温，天气晴干；夏季高压南移，印度洋湿空气流入形成热雷雨。'
      },
      {
        name: 'Córdoba (科尔多瓦)',
        country: 'Argentina',
        lat: -31.4167,
        lng: -64.1833,
        description: '季风边缘与雨影： 夏季南美低空急流输送亚马逊水汽；冬季受西风控制，处于安第斯山脉背风坡，形成干季。'
      }
    ]
  },
  {
    code: 'Cfb',
    title: '温带海洋性气候 (Oceanic)',
    cities: [
      {
        name: 'London (伦敦)',
        country: 'United Kingdom',
        lat: 51.5000,
        lng: -0.1333,
        description: '典型北大西洋暖流与西风： 洋流释放热量，温暖西风长驱直入，锋面气旋路径维持常年降水。'
      },
      {
        name: 'Melbourne (墨尔本)',
        country: 'Australia',
        lat: -37.8167,
        lng: 144.9667,
        description: '南大洋西风带： 处于极地冷锋与大陆热气团交界处。西风带冷锋扫过带来降水降温，内陆高压带来干热，天气极度多变。'
      },
      {
        name: 'Vancouver (温哥华)',
        country: 'Canada',
        lat: 49.2500,
        lng: -123.1167,
        description: '阿留申低压与地形： 冬季阿留申低压引导气旋向东移动撞击海岸山脉，地形抬升致暴雨；夏季北太平洋高压北扩阻挡风暴轴，形成相对干季，但是仍有西风带来的阵性降水。'
      },
      {
        name: 'Wellington (惠灵顿)',
        country: 'New Zealand',
        lat: -41.2833,
        lng: 174.7667,
        description: '西风带与狭管效应： 位于40°S-50°S西风带核心，库克海峡地形加速西风，带来持续强风和地形雨。'
      },
      {
        name: 'Bogotá (波哥大)',
        country: 'Colombia',
        lat: 4.6000,
        lng: -74.0833,
        description: '垂直地带性与赤道低压： 高海拔（2640m）抵消赤道高温。降水随赤道低气压带摆动，双重过境呈双峰型分布，日变化（对流）主导。'
      }
    ]
  },
  {
    code: 'Cwb',
    title: '亚热带高原季风气候 (Subtropical Highland)',
    cities: [
      {
        name: 'Kunming (昆明)',
        country: 'China',
        lat: 25.0333,
        lng: 102.7167,
        description: '著名“春城”，冬季位于昆明准静止锋暖区，晴暖干燥；夏季受西南季风影响多雨。高海拔调节夏季气温。'
      },
      {
        name: 'Mexico City (墨西哥城)',
        country: 'Mexico',
        lat: 19.4333,
        lng: -99.1333,
        description: '北美季风与盆地效应： 夏季热低压吸引海湾水汽，地形抬升致雷雨；冬季副高控制，盆地地形导致冷空气沉积和逆温，阻碍降水产生。'
      },
      {
        name: 'Addis Ababa (亚的斯亚贝巴)',
        country: 'Ethiopia',
        lat: 9.0333,
        lng: 38.7333,
        description: '赤道低气压季节性迁移： 赤道低气压带北移，叠加海拔较高，带来大雨季，高原地形冷却热带气团。'
      },
      {
        name: 'Salta (萨尔塔)',
        country: 'Argentina',
        lat: -24.7833,
        lng: -65.4167,
        description: '位于安第斯东麓，拦截来自亚马逊的低空急流形成夏雨；冬季受西风雨影效应影响极干。'
      }
    ]
  },
  {
    code: 'Cfc',
    title: '温带海洋性气候(副极地型) (Subpolar Oceanic)',
    cities: [
      {
        name: 'Reykjavík (雷克雅未克)',
        country: 'Iceland',
        lat: 64.1333,
        lng: -21.9333,
        description: '北大西洋暖流维持冬季不冻，冰岛低压驱动气旋活动带来频繁风暴。纬度高，低太阳高度角导致凉夏。'
      }
    ]
  },
  {
    code: 'Cwc',
    title: '冷夏高原季风气候 (Cold Subtropical Highland)',
    cities: [
      {
        name: 'Puno (普诺)',
        country: 'Peru',
        lat: -15.8333,
        lng: -70.0167,
        description: '玻利维亚高压与的的喀喀湖： 极高海拔（3800m+）。夏季玻利维亚高压引导东风输送水汽；冬季受干燥高空西风控制。湖体调节微气候。'
      }
    ]
  },
  {
    code: 'Csc',
    title: '冷夏型地中海气候 (Cool-summer Mediterranean)',
    cities: [
      {
        name: 'Balmaceda (巴尔马赛达)',
        country: 'Chile',
        lat: -45.9754,
        lng: -71.6988,
        description: '位于安第斯背风坡，阻挡西风水汽。夏季副高南移抑制降水，形成冷干夏；冬季西风强劲，渗透带来降雪。'
      }
    ]
  },
  {
    code: 'Dfa',
    title: '温带大陆性湿润气候 (Hot-summer Humid Continental)',
    cities: [
      {
        name: 'Almaty (阿拉木图)',
        country: 'Kazakhstan',
        lat: 43.2333,
        lng: 76.9500,
        description: '阿拉木图位于中亚腹地，天山山脉北麓。作为内陆城市，阿拉木图的大陆性极强。夏季受大陆热低压控制，炎热干燥。冬季则受蒙古高压延伸部分影响，虽有山脉阻挡部分寒流，但气温仍低于0℃。其降水主要来自西风带受地形抬升形成的降水，分布相对均匀。'
      },
      {
        name: 'Minneapolis (明尼阿波利斯)',
        country: 'United States',
        lat: 44.9820,
        lng: -93.2692,
        description: '明尼阿波利斯是Dfa气候中温差最大的城市之一。由于深居北美大陆腹地，缺乏水体调节（除了众多小湖泊），它直面来自加拿大的极地涡旋。冬季严寒，但夏季来自墨西哥湾的暖湿气流又能使其变得炎热潮湿。'
      },
      {
        name: 'Chicago (芝加哥)',
        country: 'United States',
        lat: 41.8820,
        lng: -87.6278,
        description: '芝加哥的Dfa气候深受五大湖影响。虽然夏季炎热，但湖风（Lake Breeze）常在下午调节气温。冬季寒冷，且常伴随大风。降水全年丰富且均匀，来自气旋系统带来的锋面雨。'
      }
    ]
  },
  {
    code: 'Dfb',
    title: '温带大陆性湿润气候 (Warm-summer Humid Continental)',
    cities: [
      {
        name: 'Kushiro (钏路)',
        country: 'Japan',
        lat: 42.9850,
        lng: 144.3817,
        description: '位于北海道东南部太平洋沿岸。与同纬度的札幌（Dfa）不同，钏路受寒流（亲潮）影响显著。夏季海雾弥漫，气温凉爽，最热月均温常年在20℃以下，因此属于Dfb。冬季则寒冷干燥。'
      },
      {
        name: 'Novosibirsk (新西伯利亚)',
        country: 'Russia',
        lat: 55.0500,
        lng: 82.9500,
        description: '俄罗斯西伯利亚地区最大的城市。深居亚欧大陆腹地，新西伯利亚展现了极端的Dfb特征。冬季受西伯利亚高压控制，严寒漫长；夏季虽然较短，但大陆性加热使得白天气温较高，暖季长度刚满足4个月以上10℃的标准。'
      },
      {
        name: 'Moscow (莫斯科)',
        country: 'Russia',
        lat: 55.7558,
        lng: 37.6173,
        description: '莫斯科是Dfb气候的教科书式代表。受大西洋暖湿气流的影响比西伯利亚强，因此冬季虽冷但极端低温较少。夏季温暖舒适，降水分布均匀，夏季略多。'
      },
      {
        name: 'Saint Petersburg (圣彼得堡)',
        country: 'Russia',
        lat: 59.9375,
        lng: 30.3086,
        description: '俄罗斯第二大城市，波罗的海沿岸。纬度接近60°N，属于高纬度Dfb。受波罗的海调节，冬季比同纬度内陆温暖，夏季凉爽湿润。'
      },
      {
        name: 'Kyiv (基辅)',
        country: 'Ukraine',
        lat: 50.4500,
        lng: 30.5233,
        description: '基辅位于Dfb与Dfa的过渡带，近年来随着气候变暖有向Dfa转变的趋势，但传统上归为Dfb。夏季温暖，冬季积雪期长，降水适中且全年有雨/雪。'
      },
      {
        name: 'Oslo (奥斯陆)',
        country: 'Norway',
        lat: 59.9133,
        lng: 10.7389,
        description: '挪威首都，位于奥斯陆峡湾深处。虽然斯堪的纳维亚半岛沿岸多为Cfb（温带海洋性气候），但奥斯陆因地形阻挡，冬季气温较低，属于Dfb。夏季温和宜人，拥有超长的日照时间。'
      },
      {
        name: 'Edmonton (埃德蒙顿)',
        country: 'Canada',
        lat: 53.546,
        lng: -113.490,
        description: '加拿大阿尔伯塔省省会，北美最北的主要城市之一。典型的草原省份Dfb气候。夏季温暖干燥，日温差大。'
      }
    ]
  },
  {
    code: 'Dwa',
    title: '温带季风气候 (Monsoon-influenced Hot-summer Continental)',
    cities: [
      {
        name: 'Beijing (北京)',
        country: 'China',
        lat: 39.9000,
        lng: 116.4000,
        description: '中国首都，华北平原北端。北京是Dwa气候的典型代表。夏季受东南季风控制，高温多雨；冬季受西北季风控制，寒冷干燥多风。'
      },
      {
        name: 'Harbin (哈尔滨)',
        country: 'China',
        lat: 45.7575,
        lng: 126.6408,
        description: '黑龙江省省会，冰雪之城。哈尔滨的冬季极其漫长寒冷，但夏季却短暂而炎热，满足Dwa标准。降水极度集中在夏季，符合季风指标。'
      },
      {
        name: 'Pyongyang (平壤)',
        country: 'North Korea',
        lat: 39.0167,
        lng: 125.7475,
        description: '朝鲜首都，大同江畔。平壤位于朝鲜半岛西北部，季风特征显著。夏季高温多雨，冬季寒冷干燥，属于标准的Dwa气候。'
      },
      {
        name: 'Seoul (首尔)',
        country: 'South Korea',
        lat: 37.5600,
        lng: 126.9900,
        description: '韩国首都，汉江流域。首尔的气候处于Dwa与Cwa的边缘。城市热岛效应进一步增强了其夏季的高温。'
      }
    ]
  },
  {
    code: 'Dwb',
    title: '温带季风气候 (Monsoon-influenced Warm-summer Continental)',
    cities: [
      {
        name: 'Heihe (黑河)',
        country: 'China',
        lat: 50.2400,
        lng: 127.5211,
        description: '位于中俄边境，黑龙江畔。纬度高达50度，夏季凉爽，最热月均温难以达到22℃，且夏季降水丰沛；冬季严寒干燥，完全符合Dwb特征。'
      },
      {
        name: 'Vladivostok (海参崴)',
        country: 'Russia',
        lat: 43.1150,
        lng: 131.8853,
        description: '俄罗斯远东最大港口城市。位于日本海西北岸，受海洋调节，冬季比同纬度内陆温和但仍寒冷，且受季风影响干燥多风。夏季受海洋冷湿气流和季风降水影响，凉爽湿润，多雾。'
      }
    ]
  },
  {
    code: 'Dsa',
    title: '温带大陆性气候(冬雨型) (Hot-summer Mediterranean Continental)',
    cities: [
      {
        name: 'Hakkâri (哈卡里)',
        country: 'Turkey',
        lat: 37.577,
        lng: 43.739,
        description: '土耳其东南部多山地区。位于安纳托利亚高原东部，海拔高。冬季严寒多雪，夏季炎热干燥，典型的Dsa气候。'
      },
      {
        name: 'Kabul (喀布尔)',
        country: 'Afghanistan',
        lat: 34.5458,
        lng: 69.0820,
        description: '夏季受干燥大陆气团控制，冬季山脉拦截西风降水。'
      }
    ]
  },
  {
    code: 'Dsb',
    title: '温带大陆性气候(冬雨型) (Warm-summer Mediterranean Continental)',
    cities: [
      {
        name: 'Sivas (锡瓦斯)',
        country: 'Turkey',
        lat: 39.69
        lng: 37.02,
        description: '土耳其安纳托利亚高原中部城市。海拔约1200米，使得其夏季比周边低地凉爽，冬季寒冷。降水呈夏干冬湿特征，符合Dsb。'
      }
    ]
  },
  {
    code: 'Dfc',
    title: '亚寒带针叶林气候 (Subarctic)',
    cities: [
      {
        name: 'Arkhangelsk (阿尔汉格尔斯克)',
        country: 'Russia',
        lat: 64.5431,
        lng: 40.5375,
        description: '白海港口，受海洋微弱调节。这是分布最广的亚寒带气候，覆盖了大部分加拿大和俄罗斯西伯利亚。'
      },
      {
        name: 'Tromsø (特罗姆瑟)',
        country: 'Norway',
        lat: 69.6500,
        lng: 18.9500,
        description: '位于北极圈内，受北大西洋暖流影响，冬季相对温和但夏季凉爽。'
      },
      {
        name: 'Samedan (萨梅丹)',
        country: 'Switzerland',
        lat: 46.5333,
        lng: 9.8667,
        description: '阿尔卑斯山高海拔谷地，夏季凉爽。'
      },
      {
        name: 'Labrador City (拉布拉多城)',
        country: 'Canada',
        lat: 52.9500,
        lng: -66.9167,
        description: '加拿大纽芬兰与拉布拉多省西部矿业城市。'
      },
      {
        name: 'Murmansk (摩尔曼斯克)',
        country: 'Russia',
        lat: 68.9400,
        lng: 33.0600,
        description: '著名的不冻港，受北大西洋暖流影响，全年冷湿。'
      }
    ]
  },
  {
    code: 'Dfd',
    title: '亚寒带针叶林气候（冬季极寒型） (Extremely Cold Subarctic)',
    cities: [
      {
        name: 'Yakutsk (雅库茨克)',
        country: 'Russia',
        lat: 62.0300,
        lng: 129.7300,
        description: '建在永久冻土上的最大城市，冬夏温差极大。最冷月气温极低。'
      },
      {
        name: 'Verkhoyansk (上扬斯克)',
        country: 'Russia',
        lat: 67.5500,
        lng: 133.3833,
        description: '北半球著名的“寒极”之一。'
      }
    ]
  },
  {
    code: 'Dwc',
    title: '亚寒带针叶林气候 (Monsoon-influenced Subarctic)',
    cities: [
      {
        name: 'Yushu (玉树)',
        country: 'China',
        lat: 33.0000,
        lng: 97.0000,
        description: '青藏高原腹地，海拔造就了低纬度的亚寒带气候。'
      }
    ]
  },
  {
    code: 'Dwd',
    title: '亚寒带针叶林气候（冬季极寒型） (Extremely Cold Monsoon Subarctic)',
    cities: [
      {
        name: 'Oymyakon (奥伊米亚康)',
        country: 'Russia',
        lat: 63.4608,
        lng: 142.7858,
        description: '世界“寒极”，与其说城市，不如说是村庄，曾记录到人类定居点的最低温。这是地球上人类居住的最冷气候区。'
      }
    ]
  },
  {
    code: 'Dsc',
    title: '亚寒带针叶林气候 (Dry-summer Subarctic)',
    cities: [
      {
        name: 'Anchorage (安克雷奇)',
        country: 'United States',
        lat: 61.2167,
        lng: -149.8936,
        description: '阿拉斯加最大城市，受沿海山脉雨影影响，降水呈夏末秋初多、春夏少的模式。'
      },
      {
        name: 'Whitehorse (白马城)',
        country: 'Canada',
        lat: 60.7333,
        lng: -135.0667,
        description: '育空地区首府，位于海岸山脉雨影区，相当干燥。'
      }
    ]
  },
  {
    code: 'ET',
    title: '苔原气候 (Tundra)',
    cities: [
      {
        name: 'Macquarie Island (麦夸里岛)',
        country: 'Australia',
        lat: -54.5000,
        lng: 158.9333,
        description: '南大洋上的孤岛，典型的海洋性极地气候。'
      },
      {
        name: 'Mt. Fuji (富士山顶)',
        country: 'Japan',
        lat: 35.3608,
        lng: 138.7275,
        description: '低纬度高海拔地区的高山苔原。'
      },
      {
        name: 'Ben Nevis (本尼维斯山顶)',
        country: 'UK',
        lat: 56.7969,
        lng: -5.0036,
        description: '低纬度高海拔地区的高山苔原。'
      },
      {
        name: 'Nuuk (努克)',
        country: 'Greenland',
        lat: 64.1813,
        lng: -51.7266,
        description: '格陵兰岛首府，位于沿海，夏季气温较高导致其为苔原气候而未形成冰原气候。'
      }
    ]
  },
  {
    code: 'EF',
    title: '冰原气候 (Ice Cap)',
    cities: [
      {
        name: 'Mt. Rainier (瑞尼尔山顶)',
        country: 'United States',
        lat: 46.8517,
        lng: -121.7603,
        description: '低纬度高海拔地区的高山冰原。'
      },
      {
        name: 'Kunlun Station (昆仑站)',
        country: 'China',
        lat: -80.4172,
        lng: 77.1164,
        description: '中国极地研究中心在南极建立的第三个科学考察站，位于南极大陆内部冰穹A最高点西南方向约7.3公里处，海拔4087米，是中国第一座、世界第六座南极内陆科考站，也是人类在南极地区建立的海拔最高的科考站。'
      }
    ]
  }
];