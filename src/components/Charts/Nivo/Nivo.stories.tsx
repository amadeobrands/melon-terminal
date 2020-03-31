import React from 'react';
import { fromUnixTime, format, subMonths, isBefore } from 'date-fns';
import { Nivo, NivoProps } from './Nivo';
import { toTokenBaseUnit } from '~/utils/toTokenBaseUnit';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';

export default { title: 'Charts|Nivo' };

interface CalcHistory {
  sharePrice: string;
  source: string;
  timestamp: string;
}

interface Fund {
  name: string;
  calculationsHistory: CalcHistory[];
}

const subgraphData = [
  {
    calculationsHistory: [
      {
        sharePrice: '172339259087273022',
        source: 'priceUpdate',
        timestamp: '1584936633',
      },
      {
        sharePrice: '166421155058550949',
        source: 'priceUpdate',
        timestamp: '1584850240',
      },
      {
        sharePrice: '166337426141174349',
        source: 'priceUpdate',
        timestamp: '1584763951',
      },
      {
        sharePrice: '169956537306739295',
        source: 'priceUpdate',
        timestamp: '1584700996',
      },
      {
        sharePrice: '161923233592281691',
        source: 'priceUpdate',
        timestamp: '1584604810',
      },
      {
        sharePrice: '172553994276538316',
        source: 'priceUpdate',
        timestamp: '1584518449',
      },
      {
        sharePrice: '170432995742460453',
        source: 'priceUpdate',
        timestamp: '1584432187',
      },
      {
        sharePrice: '166978219160301012',
        source: 'priceUpdate',
        timestamp: '1584382373',
      },
      {
        sharePrice: '161342039502127013',
        source: 'priceUpdate',
        timestamp: '1584375749',
      },
      {
        sharePrice: '164657304751931799',
        source: 'priceUpdate',
        timestamp: '1584345795',
      },
      {
        sharePrice: '166216225567939366',
        source: 'priceUpdate',
        timestamp: '1584259206',
      },
      {
        sharePrice: '163066966915026098',
        source: 'priceUpdate',
        timestamp: '1584172807',
      },
      {
        sharePrice: '158075518780315707',
        source: 'priceUpdate',
        timestamp: '1584099309',
      },
      {
        sharePrice: '163052979731122686',
        source: 'priceUpdate',
        timestamp: '1584038611',
      },
      {
        sharePrice: '161162063322067788',
        source: 'priceUpdate',
        timestamp: '1583914099',
      },
      {
        sharePrice: '160109833357372940',
        source: 'priceUpdate',
        timestamp: '1583828520',
      },
      {
        sharePrice: '163595423483283462',
        source: 'priceUpdate',
        timestamp: '1583741185',
      },
      {
        sharePrice: '162088846956797669',
        source: 'priceUpdate',
        timestamp: '1583676639',
      },
      {
        sharePrice: '164668347680924097',
        source: 'priceUpdate',
        timestamp: '1583585773',
      },
      {
        sharePrice: '158896950248180114',
        source: 'priceUpdate',
        timestamp: '1583521838',
      },
      {
        sharePrice: '158860254650434147',
        source: 'priceUpdate',
        timestamp: '1583520841',
      },
      {
        sharePrice: '158860432251853228',
        source: 'priceUpdate',
        timestamp: '1583519114',
      },
      {
        sharePrice: '158860433897263016',
        source: 'priceUpdate',
        timestamp: '1583519098',
      },
      {
        sharePrice: '158325362596051592',
        source: 'priceUpdate',
        timestamp: '1583483478',
      },
      {
        sharePrice: '161340742884640735',
        source: 'priceUpdate',
        timestamp: '1583397898',
      },
      {
        sharePrice: '159184127414074558',
        source: 'priceUpdate',
        timestamp: '1583312357',
      },
      {
        sharePrice: '152685669729727835',
        source: 'priceUpdate',
        timestamp: '1583226834',
      },
      {
        sharePrice: '156158707686449551',
        source: 'priceUpdate',
        timestamp: '1583141313',
      },
      {
        sharePrice: '159080349231351001',
        source: 'priceUpdate',
        timestamp: '1583054001',
      },
      {
        sharePrice: '153183566654355183',
        source: 'priceUpdate',
        timestamp: '1582966666',
      },
      {
        sharePrice: '150039796357214055',
        source: 'priceUpdate',
        timestamp: '1582879322',
      },
      {
        sharePrice: '155105876973414527',
        source: 'priceUpdate',
        timestamp: '1582791986',
      },
      {
        sharePrice: '168004123436641026',
        source: 'priceUpdate',
        timestamp: '1582706461',
      },
      {
        sharePrice: '149431467774308413',
        source: 'priceUpdate',
        timestamp: '1582620311',
      },
      {
        sharePrice: '149431482372691216',
        source: 'priceUpdate',
        timestamp: '1582620160',
      },
      {
        sharePrice: '149431485659744299',
        source: 'priceUpdate',
        timestamp: '1582620126',
      },
      {
        sharePrice: '152417646870206846',
        source: 'priceUpdate',
        timestamp: '1582591183',
      },
      {
        sharePrice: '162069399969937744',
        source: 'priceUpdate',
        timestamp: '1582547600',
      },
      {
        sharePrice: '161645303683353963',
        source: 'priceUpdate',
        timestamp: '1582460198',
      },
      {
        sharePrice: '167814753677860396',
        source: 'priceUpdate',
        timestamp: '1582372882',
      },
      {
        sharePrice: '161836110545728390',
        source: 'priceUpdate',
        timestamp: '1582281970',
      },
      {
        sharePrice: '164913431544290899',
        source: 'priceUpdate',
        timestamp: '1582244889',
      },
      {
        sharePrice: '161455689810129494',
        source: 'priceUpdate',
        timestamp: '1582157578',
      },
      {
        sharePrice: '172202999221039158',
        source: 'priceUpdate',
        timestamp: '1582070168',
      },
      {
        sharePrice: '175436769257663472',
        source: 'priceUpdate',
        timestamp: '1581982860',
      },
      {
        sharePrice: '186359772371850861',
        source: 'priceUpdate',
        timestamp: '1581897328',
      },
      {
        sharePrice: '185197954840976461',
        source: 'priceUpdate',
        timestamp: '1581824385',
      },
      {
        sharePrice: '187033497186944953',
        source: 'priceUpdate',
        timestamp: '1581738872',
      },
      {
        sharePrice: '195923184052183796',
        source: 'priceUpdate',
        timestamp: '1581653357',
      },
      {
        sharePrice: '189108476667137469',
        source: 'priceUpdate',
        timestamp: '1581567859',
      },
      {
        sharePrice: '197697985554554530',
        source: 'priceUpdate',
        timestamp: '1581482268',
      },
      {
        sharePrice: '197697987727342047',
        source: 'priceUpdate',
        timestamp: '1581482251',
      },
      {
        sharePrice: '210938884378764419',
        source: 'priceUpdate',
        timestamp: '1581396684',
      },
      {
        sharePrice: '210021608627574003',
        source: 'priceUpdate',
        timestamp: '1581311132',
      },
      {
        sharePrice: '212591804685475512',
        source: 'priceUpdate',
        timestamp: '1581225521',
      },
      {
        sharePrice: '210480589146926941',
        source: 'priceUpdate',
        timestamp: '1581139954',
      },
      {
        sharePrice: '210480604519992731',
        source: 'priceUpdate',
        timestamp: '1581139841',
      },
      {
        sharePrice: '210481262160700918',
        source: 'priceUpdate',
        timestamp: '1581135007',
      },
      {
        sharePrice: '210481266378090647',
        source: 'priceUpdate',
        timestamp: '1581134976',
      },
      {
        sharePrice: '212966166013523279',
        source: 'priceUpdate',
        timestamp: '1581089803',
      },
      {
        sharePrice: '221343212012389296',
        source: 'priceUpdate',
        timestamp: '1581003909',
      },
      {
        sharePrice: '221343214015136103',
        source: 'priceUpdate',
        timestamp: '1581003895',
      },
      {
        sharePrice: '228916465388788085',
        source: 'priceUpdate',
        timestamp: '1580841891',
      },
      {
        sharePrice: '228916540538457570',
        source: 'priceUpdate',
        timestamp: '1580841383',
      },
      {
        sharePrice: '228916826787690745',
        source: 'priceUpdate',
        timestamp: '1580839448',
      },
      {
        sharePrice: '231336716981385485',
        source: 'priceUpdate',
        timestamp: '1580729952',
      },
      {
        sharePrice: '242750908904286670',
        source: 'priceUpdate',
        timestamp: '1580644393',
      },
      {
        sharePrice: '252634341098583120',
        source: 'priceUpdate',
        timestamp: '1580558843',
      },
      {
        sharePrice: '256464693283975740',
        source: 'priceUpdate',
        timestamp: '1580472125',
      },
      {
        sharePrice: '282249984349767948',
        source: 'priceUpdate',
        timestamp: '1580386590',
      },
      {
        sharePrice: '273897988005294423',
        source: 'priceUpdate',
        timestamp: '1580300533',
      },
      {
        sharePrice: '273897993667338475',
        source: 'priceUpdate',
        timestamp: '1580300501',
      },
      {
        sharePrice: '281603805174429306',
        source: 'priceUpdate',
        timestamp: '1580214967',
      },
      {
        sharePrice: '291759315596420627',
        source: 'priceUpdate',
        timestamp: '1580129455',
      },
      {
        sharePrice: '299460558280206263',
        source: 'priceUpdate',
        timestamp: '1580115433',
      },
      {
        sharePrice: '105625796944890',
        source: 'priceUpdate',
        timestamp: '1580029915',
      },
      {
        sharePrice: '105631645671606',
        source: 'priceUpdate',
        timestamp: '1579944185',
      },
      {
        sharePrice: '105637481436021',
        source: 'priceUpdate',
        timestamp: '1579858645',
      },
      {
        sharePrice: '249157287410335647',
        source: 'priceUpdate',
        timestamp: '1579772912',
      },
      {
        sharePrice: '210401357291690916',
        source: 'priceUpdate',
        timestamp: '1579687329',
      },
      {
        sharePrice: '203548819766559602',
        source: 'priceUpdate',
        timestamp: '1579601631',
      },
      {
        sharePrice: '201426129294456042',
        source: 'priceUpdate',
        timestamp: '1579516114',
      },
      {
        sharePrice: '201426141389659050',
        source: 'priceUpdate',
        timestamp: '1579516021',
      },
      {
        sharePrice: '194512365423347463',
        source: 'priceUpdate',
        timestamp: '1579429474',
      },
      {
        sharePrice: '203590915286733844',
        source: 'priceUpdate',
        timestamp: '1579343959',
      },
      {
        sharePrice: '192998378835450118',
        source: 'priceUpdate',
        timestamp: '1579258372',
      },
      {
        sharePrice: '196713983904109604',
        source: 'priceUpdate',
        timestamp: '1579172849',
      },
      {
        sharePrice: '197049582534489228',
        source: 'priceUpdate',
        timestamp: '1579087328',
      },
      {
        sharePrice: '199848884762834648',
        source: 'priceUpdate',
        timestamp: '1579001820',
      },
      {
        sharePrice: '194283796432190638',
        source: 'priceUpdate',
        timestamp: '1578916307',
      },
      {
        sharePrice: '198294245392644907',
        source: 'priceUpdate',
        timestamp: '1578830397',
      },
      {
        sharePrice: '198305189866532443',
        source: 'priceUpdate',
        timestamp: '1578744878',
      },
      {
        sharePrice: '203104572482872151',
        source: 'priceUpdate',
        timestamp: '1578659307',
      },
      {
        sharePrice: '195616503183645609',
        source: 'priceUpdate',
        timestamp: '1578642880',
      },
      {
        sharePrice: '195568674655154848',
        source: 'priceUpdate',
        timestamp: '1578557375',
      },
      {
        sharePrice: '195775736277778677',
        source: 'priceUpdate',
        timestamp: '1578471859',
      },
      {
        sharePrice: '193592082092519221',
        source: 'priceUpdate',
        timestamp: '1578386250',
      },
      {
        sharePrice: '196355244396446404',
        source: 'priceUpdate',
        timestamp: '1578300372',
      },
      {
        sharePrice: '202028235449810960',
        source: 'priceUpdate',
        timestamp: '1578214636',
      },
      {
        sharePrice: '190358041180258615',
        source: 'priceUpdate',
        timestamp: '1578129128',
      },
    ],
    name: 'HelloFund',
    createdAt: '1578514013',
  },
  {
    calculationsHistory: [
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584936633',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584850240',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584763951',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584700996',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584604810',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584518449',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584432187',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584382373',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584375749',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584345795',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'priceUpdate',
        timestamp: '1584259206',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'redemption',
        timestamp: '1584199569',
      },
      {
        sharePrice: '1069471861729925686',
        source: 'priceUpdate',
        timestamp: '1584172807',
      },
      {
        sharePrice: '1063473808827246641',
        source: 'priceUpdate',
        timestamp: '1584099309',
      },
      {
        sharePrice: '1067927138041622997',
        source: 'priceUpdate',
        timestamp: '1584038611',
      },
      {
        sharePrice: '1012940794566975842',
        source: 'priceUpdate',
        timestamp: '1583914099',
      },
      {
        sharePrice: '1011012743391759491',
        source: 'priceUpdate',
        timestamp: '1583828520',
      },
      {
        sharePrice: '1014584285888355153',
        source: 'priceUpdate',
        timestamp: '1583741185',
      },
      {
        sharePrice: '1003168859822420969',
        source: 'priceUpdate',
        timestamp: '1583676639',
      },
      {
        sharePrice: '1001657440462945955',
        source: 'priceUpdate',
        timestamp: '1583585773',
      },
      {
        sharePrice: '991047967568895784',
        source: 'priceUpdate',
        timestamp: '1583521838',
      },
      {
        sharePrice: '990859096326371078',
        source: 'priceUpdate',
        timestamp: '1583520841',
      },
      {
        sharePrice: '991087363903351417',
        source: 'priceUpdate',
        timestamp: '1583519114',
      },
      {
        sharePrice: '991087368933794857',
        source: 'priceUpdate',
        timestamp: '1583519098',
      },
      {
        sharePrice: '990771585932862073',
        source: 'priceUpdate',
        timestamp: '1583483478',
      },
      {
        sharePrice: '1000657085180436745',
        source: 'priceUpdate',
        timestamp: '1583397898',
      },
      {
        sharePrice: '996484476781867079',
        source: 'priceUpdate',
        timestamp: '1583312357',
      },
      {
        sharePrice: '980970614248468685',
        source: 'priceUpdate',
        timestamp: '1583226834',
      },
      {
        sharePrice: '992059387878435544',
        source: 'priceUpdate',
        timestamp: '1583141313',
      },
      {
        sharePrice: '999418432742634629',
        source: 'priceUpdate',
        timestamp: '1583054001',
      },
      {
        sharePrice: '981955071018665623',
        source: 'priceUpdate',
        timestamp: '1582966666',
      },
      {
        sharePrice: '975955325703291311',
        source: 'priceUpdate',
        timestamp: '1582879322',
      },
      {
        sharePrice: '986165080724106073',
        source: 'priceUpdate',
        timestamp: '1582791986',
      },
      {
        sharePrice: '1012124727072419394',
        source: 'trading',
        timestamp: '1582752870',
      },
      {
        sharePrice: '1010413790932619727',
        source: 'trading',
        timestamp: '1582735063',
      },
      {
        sharePrice: '1007102629831090270',
        source: 'priceUpdate',
        timestamp: '1582706461',
      },
      {
        sharePrice: '943512357213482529',
        source: 'priceUpdate',
        timestamp: '1582620311',
      },
      {
        sharePrice: '943507630021259653',
        source: 'priceUpdate',
        timestamp: '1582620160',
      },
      {
        sharePrice: '943507125059994382',
        source: 'priceUpdate',
        timestamp: '1582620126',
      },
      {
        sharePrice: '946905087968119622',
        source: 'priceUpdate',
        timestamp: '1582591183',
      },
      {
        sharePrice: '963508084411589989',
        source: 'trading',
        timestamp: '1582551745',
      },
      {
        sharePrice: '963708575219412270',
        source: 'trading',
        timestamp: '1582551657',
      },
      {
        sharePrice: '964358465473401880',
        source: 'priceUpdate',
        timestamp: '1582547600',
      },
      {
        sharePrice: '965197845497748416',
        source: 'priceUpdate',
        timestamp: '1582460198',
      },
      {
        sharePrice: '988845323801610497',
        source: 'priceUpdate',
        timestamp: '1582372882',
      },
      {
        sharePrice: '975534642949245194',
        source: 'trading',
        timestamp: '1582319507',
      },
      {
        sharePrice: '975442846547557700',
        source: 'trading',
        timestamp: '1582318693',
      },
      {
        sharePrice: '975244660337281532',
        source: 'trading',
        timestamp: '1582318033',
      },
      {
        sharePrice: '975263720963587674',
        source: 'trading',
        timestamp: '1582317569',
      },
      {
        sharePrice: '975281372165402419',
        source: 'trading',
        timestamp: '1582313975',
      },
      {
        sharePrice: '975301685608774512',
        source: 'trading',
        timestamp: '1582313779',
      },
      {
        sharePrice: '975301966453233405',
        source: 'trading',
        timestamp: '1582312871',
      },
      {
        sharePrice: '975311523442212636',
        source: 'priceUpdate',
        timestamp: '1582281970',
      },
      {
        sharePrice: '987572104280463409',
        source: 'priceUpdate',
        timestamp: '1582244889',
      },
      {
        sharePrice: '975421806957761913',
        source: 'trading',
        timestamp: '1582235482',
      },
      {
        sharePrice: '977361010336968398',
        source: 'trading',
        timestamp: '1582234242',
      },
      {
        sharePrice: '976966659193583873',
        source: 'trading',
        timestamp: '1582232299',
      },
      {
        sharePrice: '976267570591985467',
        source: 'trading',
        timestamp: '1582221718',
      },
      {
        sharePrice: '978214258075183676',
        source: 'trading',
        timestamp: '1582215601',
      },
      {
        sharePrice: '971201160201944884',
        source: 'trading',
        timestamp: '1582215371',
      },
      {
        sharePrice: '970676803136648955',
        source: 'investment',
        timestamp: '1582205391',
      },
      {
        sharePrice: '970691520254133624',
        source: 'priceUpdate',
        timestamp: '1582157578',
      },
      {
        sharePrice: '1011800114683240551',
        source: 'trading',
        timestamp: '1582143325',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'investment',
        timestamp: '1582142083',
      },
      {
        sharePrice: '1000000000000000000',
        source: 'fundCreation',
        timestamp: '1582141463',
      },
    ],
    name: 'EFK Capital',
    createdAt: '1582137015',
  },
  {
    calculationsHistory: [
      {
        sharePrice: '3906083962776450009',
        source: 'priceUpdate',
        timestamp: '1584936633',
      },
      {
        sharePrice: '4000071612941858612',
        source: 'priceUpdate',
        timestamp: '1584850240',
      },
      {
        sharePrice: '4043214715438590626',
        source: 'priceUpdate',
        timestamp: '1584763951',
      },
      {
        sharePrice: '4090120394737914371',
        source: 'priceUpdate',
        timestamp: '1584700996',
      },
      {
        sharePrice: '4367099378140761776',
        source: 'priceUpdate',
        timestamp: '1584604810',
      },
      {
        sharePrice: '4231105875719840820',
        source: 'priceUpdate',
        timestamp: '1584518449',
      },
      {
        sharePrice: '4251215262574541883',
        source: 'priceUpdate',
        timestamp: '1584432187',
      },
      {
        sharePrice: '4000370457027424122',
        source: 'priceUpdate',
        timestamp: '1584382373',
      },
      {
        sharePrice: '4114263428773880113',
        source: 'priceUpdate',
        timestamp: '1584375749',
      },
      {
        sharePrice: '3948499846650944767',
        source: 'priceUpdate',
        timestamp: '1584345795',
      },
      {
        sharePrice: '4372498271387708204',
        source: 'priceUpdate',
        timestamp: '1584259206',
      },
      {
        sharePrice: '4457602057409230025',
        source: 'priceUpdate',
        timestamp: '1584172807',
      },
      {
        sharePrice: '4345435019979813812',
        source: 'priceUpdate',
        timestamp: '1584099309',
      },
      {
        sharePrice: '4579072770444731320',
        source: 'priceUpdate',
        timestamp: '1584038611',
      },
      {
        sharePrice: '4527213598921882795',
        source: 'priceUpdate',
        timestamp: '1583914099',
      },
      {
        sharePrice: '4048257639583096549',
        source: 'priceUpdate',
        timestamp: '1583828520',
      },
      {
        sharePrice: '3812585652170050605',
        source: 'priceUpdate',
        timestamp: '1583741185',
      },
      {
        sharePrice: '3943573143270946676',
        source: 'priceUpdate',
        timestamp: '1583676639',
      },
      {
        sharePrice: '3833248701590200106',
        source: 'priceUpdate',
        timestamp: '1583585773',
      },
      {
        sharePrice: '3559691767174143077',
        source: 'priceUpdate',
        timestamp: '1583521838',
      },
      {
        sharePrice: '3553785217247301256',
        source: 'priceUpdate',
        timestamp: '1583520841',
      },
      {
        sharePrice: '3559846331315266331',
        source: 'priceUpdate',
        timestamp: '1583519114',
      },
      {
        sharePrice: '3559846348080433016',
        source: 'priceUpdate',
        timestamp: '1583519098',
      },
      {
        sharePrice: '3486895832510948509',
        source: 'priceUpdate',
        timestamp: '1583483478',
      },
      {
        sharePrice: '3470168151274987537',
        source: 'priceUpdate',
        timestamp: '1583397898',
      },
      {
        sharePrice: '3220524587994600441',
        source: 'priceUpdate',
        timestamp: '1583312357',
      },
      {
        sharePrice: '3430833024680363558',
        source: 'priceUpdate',
        timestamp: '1583226834',
      },
      {
        sharePrice: '3568655903651837816',
        source: 'priceUpdate',
        timestamp: '1583141313',
      },
      {
        sharePrice: '4109345504782466552',
        source: 'priceUpdate',
        timestamp: '1583054001',
      },
      {
        sharePrice: '2799574712356344069',
        source: 'priceUpdate',
        timestamp: '1582966666',
      },
      {
        sharePrice: '2773984668113769306',
        source: 'priceUpdate',
        timestamp: '1582879322',
      },
      {
        sharePrice: '2521695959151188644',
        source: 'priceUpdate',
        timestamp: '1582791986',
      },
      {
        sharePrice: '2473434111537919261',
        source: 'priceUpdate',
        timestamp: '1582706461',
      },
      {
        sharePrice: '2389797696004435763',
        source: 'priceUpdate',
        timestamp: '1582620311',
      },
      {
        sharePrice: '2387382605707466739',
        source: 'priceUpdate',
        timestamp: '1582620160',
      },
      {
        sharePrice: '2387382629935172380',
        source: 'priceUpdate',
        timestamp: '1582620126',
      },
      {
        sharePrice: '2513491444579283797',
        source: 'priceUpdate',
        timestamp: '1582591183',
      },
      {
        sharePrice: '2544893832185901667',
        source: 'priceUpdate',
        timestamp: '1582547600',
      },
      {
        sharePrice: '2320497928647630108',
        source: 'priceUpdate',
        timestamp: '1582460198',
      },
      {
        sharePrice: '2547131805367045688',
        source: 'priceUpdate',
        timestamp: '1582372882',
      },
      {
        sharePrice: '2313822093260838137',
        source: 'priceUpdate',
        timestamp: '1582281970',
      },
      {
        sharePrice: '2266357895556340797',
        source: 'priceUpdate',
        timestamp: '1582244889',
      },
      {
        sharePrice: '2146190602377553932',
        source: 'priceUpdate',
        timestamp: '1582157578',
      },
      {
        sharePrice: '1933952266453468447',
        source: 'priceUpdate',
        timestamp: '1582070168',
      },
      {
        sharePrice: '1841131338188664285',
        source: 'priceUpdate',
        timestamp: '1581982860',
      },
      {
        sharePrice: '1861490559070952785',
        source: 'priceUpdate',
        timestamp: '1581897328',
      },
      {
        sharePrice: '1879419803950103175',
        source: 'priceUpdate',
        timestamp: '1581824385',
      },
      {
        sharePrice: '1906085281592894554',
        source: 'priceUpdate',
        timestamp: '1581738872',
      },
      {
        sharePrice: '1903346415025742506',
        source: 'priceUpdate',
        timestamp: '1581653357',
      },
      {
        sharePrice: '1740815041887304801',
        source: 'priceUpdate',
        timestamp: '1581567859',
      },
      {
        sharePrice: '1776648517452317867',
        source: 'priceUpdate',
        timestamp: '1581482268',
      },
      {
        sharePrice: '1776648526600954410',
        source: 'priceUpdate',
        timestamp: '1581482251',
      },
      {
        sharePrice: '1825316499134479432',
        source: 'priceUpdate',
        timestamp: '1581396684',
      },
      {
        sharePrice: '1808787612209809556',
        source: 'priceUpdate',
        timestamp: '1581311132',
      },
      {
        sharePrice: '1776931743768064941',
        source: 'priceUpdate',
        timestamp: '1581225521',
      },
      {
        sharePrice: '1815282307086268108',
        source: 'priceUpdate',
        timestamp: '1581139954',
      },
      {
        sharePrice: '1815282369134958313',
        source: 'priceUpdate',
        timestamp: '1581139841',
      },
      {
        sharePrice: '1818834696563953409',
        source: 'priceUpdate',
        timestamp: '1581135007',
      },
      {
        sharePrice: '1819665950875850272',
        source: 'priceUpdate',
        timestamp: '1581134976',
      },
      {
        sharePrice: '1808237672833077531',
        source: 'priceUpdate',
        timestamp: '1581089803',
      },
      {
        sharePrice: '1801480797228165962',
        source: 'priceUpdate',
        timestamp: '1581003909',
      },
      {
        sharePrice: '1801480804860238293',
        source: 'priceUpdate',
        timestamp: '1581003895',
      },
      {
        sharePrice: '2042578937355096163',
        source: 'priceUpdate',
        timestamp: '1580841891',
      },
      {
        sharePrice: '2042579249180520580',
        source: 'priceUpdate',
        timestamp: '1580841383',
      },
      {
        sharePrice: '2035125292757516009',
        source: 'priceUpdate',
        timestamp: '1580839448',
      },
      {
        sharePrice: '1828005743734038012',
        source: 'priceUpdate',
        timestamp: '1580729952',
      },
      {
        sharePrice: '1825764783980338133',
        source: 'priceUpdate',
        timestamp: '1580644393',
      },
      {
        sharePrice: '1867558184014810937',
        source: 'priceUpdate',
        timestamp: '1580558843',
      },
      {
        sharePrice: '1864225530378043520',
        source: 'priceUpdate',
        timestamp: '1580472125',
      },
      {
        sharePrice: '1814164135067928890',
        source: 'priceUpdate',
        timestamp: '1580386590',
      },
      {
        sharePrice: '1834646445641447156',
        source: 'priceUpdate',
        timestamp: '1580300533',
      },
      {
        sharePrice: '1834646463384609969',
        source: 'priceUpdate',
        timestamp: '1580300501',
      },
      {
        sharePrice: '1928542540945836865',
        source: 'priceUpdate',
        timestamp: '1580214967',
      },
      {
        sharePrice: '1972059707441481046',
        source: 'priceUpdate',
        timestamp: '1580129455',
      },
      {
        sharePrice: '1970632552208721020',
        source: 'priceUpdate',
        timestamp: '1580115433',
      },
      {
        sharePrice: '1925266450130526363',
        source: 'priceUpdate',
        timestamp: '1580029915',
      },
      {
        sharePrice: '1912685851334537912',
        source: 'priceUpdate',
        timestamp: '1579944185',
      },
      {
        sharePrice: '1807846238289693390',
        source: 'priceUpdate',
        timestamp: '1579858645',
      },
      {
        sharePrice: '1749429070496002960',
        source: 'priceUpdate',
        timestamp: '1579772912',
      },
      {
        sharePrice: '1790494299166427657',
        source: 'priceUpdate',
        timestamp: '1579687329',
      },
      {
        sharePrice: '1808586630556729090',
        source: 'priceUpdate',
        timestamp: '1579601631',
      },
      {
        sharePrice: '1865335972778562333',
        source: 'priceUpdate',
        timestamp: '1579516114',
      },
      {
        sharePrice: '1865336025144681598',
        source: 'priceUpdate',
        timestamp: '1579516021',
      },
      {
        sharePrice: '1820405963975034580',
        source: 'priceUpdate',
        timestamp: '1579429474',
      },
      {
        sharePrice: '1844704912864184884',
        source: 'priceUpdate',
        timestamp: '1579343959',
      },
      {
        sharePrice: '1806975670212946451',
        source: 'priceUpdate',
        timestamp: '1579258372',
      },
      {
        sharePrice: '1787467784961108535',
        source: 'priceUpdate',
        timestamp: '1579172849',
      },
      {
        sharePrice: '1591808961300767473',
        source: 'priceUpdate',
        timestamp: '1579087328',
      },
      {
        sharePrice: '1675314659610935939',
        source: 'priceUpdate',
        timestamp: '1579001820',
      },
      {
        sharePrice: '1711766795565279403',
        source: 'priceUpdate',
        timestamp: '1578916307',
      },
      {
        sharePrice: '1636326331423826570',
        source: 'priceUpdate',
        timestamp: '1578830397',
      },
      {
        sharePrice: '1617448285335071670',
        source: 'priceUpdate',
        timestamp: '1578744878',
      },
      {
        sharePrice: '1633469195253487875',
        source: 'priceUpdate',
        timestamp: '1578659307',
      },
      {
        sharePrice: '1617207298010361686',
        source: 'priceUpdate',
        timestamp: '1578642880',
      },
      {
        sharePrice: '1642934351009173725',
        source: 'priceUpdate',
        timestamp: '1578557375',
      },
      {
        sharePrice: '1617210234648329580',
        source: 'priceUpdate',
        timestamp: '1578471859',
      },
      {
        sharePrice: '1717362084015912979',
        source: 'priceUpdate',
        timestamp: '1578386250',
      },
      {
        sharePrice: '1844728760268119390',
        source: 'priceUpdate',
        timestamp: '1578300372',
      },
      {
        sharePrice: '1710979284836675959',
        source: 'priceUpdate',
        timestamp: '1578214636',
      },
      {
        sharePrice: '1756127665552929238',
        source: 'priceUpdate',
        timestamp: '1578129128',
      },
    ],
    name: 'AVANTGARDE',
    createdAt: '1563462093',
  },
];

/**
 * Takes in an object returned from the subgraph.
 * formats it as { id: string, data: {x: string, y: number}[]} where x is the date and y is the shareprice
 * and filters out repeated dates (takes the first timestamp each day)
 * - array is reversed because data pulled from most recent date backwards
 *
 * question here - how to get the first date from the subgraph. Can't take the createdAt date as that won't always match the price data.
 * does the price data get cut off at 100 items?
 *
 * @param obj
 */

function singleFundQuery(startDate: Date, endDate: Date) {
  const today = new Date();
  const earliestDate = subgraphData
    .map(object => parseInt(object.createdAt))
    .reduce((acc, curr) => {
      return acc < curr ? acc : curr;
    }, today.getTime());
  return {
    earliestDate: earliestDate,
    data: subgraphData.map(object => {
      const seen = {} as { [key: string]: boolean };
      return {
        id: object.name,
        data: object.calculationsHistory
          .filter(filterItem => {
            const itemDate = fromUnixTime(parseInt(filterItem.timestamp));
            return isBefore(startDate, itemDate) && isBefore(itemDate, today);
          })
          .reverse()
          .map(item => {
            const date = format(fromUnixTime(parseInt(item.timestamp)), 'yyyy-MM-dd');

            return {
              y: fromTokenBaseUnit(item.sharePrice, 18).toPrecision(4),
              x: date,
            };
          })
          .filter(filterItem => {
            if (!seen.hasOwnProperty(filterItem.x)) {
              seen[filterItem.x] = true;
              return true;
            }
          }),
      };
    }),
  };
}

export const Default: React.FC = () => <Nivo generator={singleFundQuery} />;
