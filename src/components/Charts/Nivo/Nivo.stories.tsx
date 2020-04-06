import React from 'react';
import { fromUnixTime, format, isBefore } from 'date-fns';
import { Nivo } from './Nivo';
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

function singleFundQuery(startDate: number) {
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
            const itemDate = parseInt(filterItem.timestamp);
            const itemPrice = fromTokenBaseUnit(filterItem.sharePrice, 18);
            return (
              isBefore(startDate, itemDate) &&
              isBefore(itemDate, today) &&
              !itemPrice.isNaN() &&
              itemPrice.isGreaterThan(0)
            );
          })
          .reverse()
          .map((item) => {
            const date = format(fromUnixTime(parseInt(item.timestamp)), 'yyyy-MM-dd');
            const price = fromTokenBaseUnit(item.sharePrice, 18).toNumber().toFixed(4);
          
            return {
              y: price,
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
function averageOfTwo(array: any[], index: number) {
  return (array[index - 1] + array[index + 1]) / 2;
}
const helloFund = {
  calculationsHistory: [
    {
      sharePrice: '963609645967736982',
      source: 'priceUpdate',
      timestamp: '1551627596',
    },
    {
      sharePrice: '928268328069206189',
      source: 'priceUpdate',
      timestamp: '1551714004',
    },
    {
      sharePrice: '839955898236479887',
      source: 'priceUpdate',
      timestamp: '1551777953',
    },
    {
      sharePrice: '863259636964379914',
      source: 'priceUpdate',
      timestamp: '1551800405',
    },
    {
      sharePrice: '890420535787322174',
      source: 'priceUpdate',
      timestamp: '1551886810',
    },
    {
      sharePrice: '853056090765771746',
      source: 'priceUpdate',
      timestamp: '1551973204',
    },
    {
      sharePrice: '819645707626147702',
      source: 'priceUpdate',
      timestamp: '1552048132',
    },
    {
      sharePrice: '840222207134070032',
      source: 'priceUpdate',
      timestamp: '1552181754',
    },
    {
      sharePrice: '840211203904120446',
      source: 'priceUpdate',
      timestamp: '1552202394',
    },
    {
      sharePrice: '843691910290307625',
      source: 'priceUpdate',
      timestamp: '1552242957',
    },
    {
      sharePrice: '828433492247323316',
      source: 'priceUpdate',
      timestamp: '1552329251',
    },
    {
      sharePrice: '855316544739597241',
      source: 'priceUpdate',
      timestamp: '1552415646',
    },
    {
      sharePrice: '865530511633705933',
      source: 'priceUpdate',
      timestamp: '1552502041',
    },
    {
      sharePrice: '851646156568872813',
      source: 'priceUpdate',
      timestamp: '1552588404',
    },
    {
      sharePrice: '827003517796449559',
      source: 'priceUpdate',
      timestamp: '1552674814',
    },
    {
      sharePrice: '825732686371376722',
      source: 'priceUpdate',
      timestamp: '1552767563',
    },
    {
      sharePrice: '785801220111210736',
      source: 'priceUpdate',
      timestamp: '1552853941',
    },
    {
      sharePrice: '737392181195189645',
      source: 'priceUpdate',
      timestamp: '1552940367',
    },
    {
      sharePrice: '668623658494007925',
      source: 'priceUpdate',
      timestamp: '1553026767',
    },
    {
      sharePrice: '603229910701503951',
      source: 'priceUpdate',
      timestamp: '1553113169',
    },
    {
      sharePrice: '627819856459846723',
      source: 'priceUpdate',
      timestamp: '1553199566',
    },
    {
      sharePrice: '611750339301655022',
      source: 'priceUpdate',
      timestamp: '1553285960',
    },
    {
      sharePrice: '606500671514239710',
      source: 'priceUpdate',
      timestamp: '1553372391',
    },
    {
      sharePrice: '564091062778373310',
      source: 'priceUpdate',
      timestamp: '1553458786',
    },
    {
      sharePrice: '540113719697147947',
      source: 'priceUpdate',
      timestamp: '1553545168',
    },
    {
      sharePrice: '479428138533498102',
      source: 'priceUpdate',
      timestamp: '1553757819',
    },
    {
      sharePrice: '426189365838364862',
      source: 'priceUpdate',
      timestamp: '1553792844',
    },
    {
      sharePrice: '429639932466079986',
      source: 'priceUpdate',
      timestamp: '1553879240',
    },
    {
      sharePrice: '498890585356064590',
      source: 'priceUpdate',
      timestamp: '1553965633',
    },
    {
      sharePrice: '500837335797634192',
      source: 'priceUpdate',
      timestamp: '1554052035',
    },
    {
      sharePrice: '536552195476228515',
      source: 'priceUpdate',
      timestamp: '1554138473',
    },
    {
      sharePrice: '514011463514784382',
      source: 'priceUpdate',
      timestamp: '1554224844',
    },
    {
      sharePrice: '469302453860509720',
      source: 'priceUpdate',
      timestamp: '1554374905',
    },
    {
      sharePrice: '449083980213288140',
      source: 'priceUpdate',
      timestamp: '1554461351',
    },
    {
      sharePrice: '448349397741575644',
      source: 'priceUpdate',
      timestamp: '1554547717',
    },
    {
      sharePrice: '485009797259741192',
      source: 'priceUpdate',
      timestamp: '1554634117',
    },
    {
      sharePrice: '450765411282667149',
      source: 'priceUpdate',
      timestamp: '1554730478',
    },
    {
      sharePrice: '449592468195531267',
      source: 'priceUpdate',
      timestamp: '1554816889',
    },
    {
      sharePrice: '428931031694432631',
      source: 'priceUpdate',
      timestamp: '1554903305',
    },
    {
      sharePrice: '443987360079045750',
      source: 'priceUpdate',
      timestamp: '1554989670',
    },
    {
      sharePrice: '428957713230985589',
      source: 'priceUpdate',
      timestamp: '1555076090',
    },
    {
      sharePrice: '438469894982200459',
      source: 'priceUpdate',
      timestamp: '1555167785',
    },
    {
      sharePrice: '438445814883781984',
      source: 'priceUpdate',
      timestamp: '1555254178',
    },
    {
      sharePrice: '433866533829309636',
      source: 'priceUpdate',
      timestamp: '1555408310',
    },
    {
      sharePrice: '431201190544600266',
      source: 'priceUpdate',
      timestamp: '1555575905',
    },
    {
      sharePrice: '416408411774563327',
      source: 'priceUpdate',
      timestamp: '1555662234',
    },
    {
      sharePrice: '455707456984140633',
      source: 'priceUpdate',
      timestamp: '1555748685',
    },
    {
      sharePrice: '455487947355810328',
      source: 'priceUpdate',
      timestamp: '1555832418',
    },
    {
      sharePrice: '425973791206559366',
      source: 'priceUpdate',
      timestamp: '1555928273',
    },
    {
      sharePrice: '426408239298380696',
      source: 'priceUpdate',
      timestamp: '1556014669',
    },
    {
      sharePrice: '416626885483882094',
      source: 'priceUpdate',
      timestamp: '1556101053',
    },
    {
      sharePrice: '416319898057350123',
      source: 'priceUpdate',
      timestamp: '1556187461',
    },
    {
      sharePrice: '421127471773994670',
      source: 'priceUpdate',
      timestamp: '1556273851',
    },
    {
      sharePrice: '435903365973790813',
      source: 'priceUpdate',
      timestamp: '1556360271',
    },
    {
      sharePrice: '438171385976144039',
      source: 'priceUpdate',
      timestamp: '1556366869',
    },
    {
      sharePrice: '399605915891668412',
      source: 'priceUpdate',
      timestamp: '1556453222',
    },
    {
      sharePrice: '413784075539716386',
      source: 'priceUpdate',
      timestamp: '1556630174',
    },
    {
      sharePrice: '422506686818815309',
      source: 'priceUpdate',
      timestamp: '1556793134',
    },
    {
      sharePrice: '422712638358010123',
      source: 'priceUpdate',
      timestamp: '1556836592',
    },
    {
      sharePrice: '414259722183801848',
      source: 'priceUpdate',
      timestamp: '1556923002',
    },
    {
      sharePrice: '404227372803643176',
      source: 'priceUpdate',
      timestamp: '1557009411',
    },
    {
      sharePrice: '404216909988919233',
      source: 'priceUpdate',
      timestamp: '1557050081',
    },
    {
      sharePrice: '395162501714473937',
      source: 'priceUpdate',
      timestamp: '1557136501',
    },
    {
      sharePrice: '369747243619098654',
      source: 'priceUpdate',
      timestamp: '1557226120',
    },
    {
      sharePrice: '362093728530257647',
      source: 'priceUpdate',
      timestamp: '1557253992',
    },
    {
      sharePrice: '346716530986568155',
      source: 'priceUpdate',
      timestamp: '1557349096',
    },
    {
      sharePrice: '349595075869103408',
      source: 'priceUpdate',
      timestamp: '1557435508',
    },
    {
      sharePrice: '361536946822313623',
      source: 'priceUpdate',
      timestamp: '1557496585',
    },
    {
      sharePrice: '361536580402400724',
      source: 'priceUpdate',
      timestamp: '1557498177',
    },
    {
      sharePrice: '361536550941503203',
      source: 'priceUpdate',
      timestamp: '1557498305',
    },
    {
      sharePrice: '361536490178402068',
      source: 'priceUpdate',
      timestamp: '1557498569',
    },
    {
      sharePrice: '361536417216648057',
      source: 'priceUpdate',
      timestamp: '1557498886',
    },
    {
      sharePrice: '368690597571681559',
      source: 'priceUpdate',
      timestamp: '1557525919',
    },
    {
      sharePrice: '368690361441516303',
      source: 'priceUpdate',
      timestamp: '1557526925',
    },
    {
      sharePrice: '389944485842070488',
      source: 'priceUpdate',
      timestamp: '1557579688',
    },
    {
      sharePrice: '373265165675455217',
      source: 'priceUpdate',
      timestamp: '1557601227',
    },
    {
      sharePrice: '301811967941990284',
      source: 'priceUpdate',
      timestamp: '1557819297',
    },
    {
      sharePrice: '306382920858413312',
      source: 'priceUpdate',
      timestamp: '1557860604',
    },
    {
      sharePrice: '278575161965376689',
      source: 'priceUpdate',
      timestamp: '1557950933',
    },
    {
      sharePrice: '266150082695850274',
      source: 'priceUpdate',
      timestamp: '1558012622',
    },
    {
      sharePrice: '264086804823863465',
      source: 'priceUpdate',
      timestamp: '1558032257',
    },
    {
      sharePrice: '265494585213414973',
      source: 'priceUpdate',
      timestamp: '1558099075',
    },
    {
      sharePrice: '239726871407155909',
      source: 'priceUpdate',
      timestamp: '1558185405',
    },
    {
      sharePrice: '236757243513653510',
      source: 'priceUpdate',
      timestamp: '1558271802',
    },
    {
      sharePrice: '234310698884821476',
      source: 'priceUpdate',
      timestamp: '1558404735',
    },
    {
      sharePrice: '237575579431655885',
      source: 'priceUpdate',
      timestamp: '1558526059',
    },
    {
      sharePrice: '251554119305139313',
      source: 'priceUpdate',
      timestamp: '1558612471',
    },
    {
      sharePrice: '255475232082905749',
      source: 'priceUpdate',
      timestamp: '1558698863',
    },
    {
      sharePrice: '248477514073931639',
      source: 'priceUpdate',
      timestamp: '1558824967',
    },
    {
      sharePrice: '239238198009141046',
      source: 'priceUpdate',
      timestamp: '1558911368',
    },
    {
      sharePrice: '218559039416017536',
      source: 'priceUpdate',
      timestamp: '1558997770',
    },
    {
      sharePrice: '214904708014573621',
      source: 'priceUpdate',
      timestamp: '1559084170',
    },
    {
      sharePrice: '192693029411552420',
      source: 'priceUpdate',
      timestamp: '1559170562',
    },
    {
      sharePrice: '180390021257479976',
      source: 'priceUpdate',
      timestamp: '1559256958',
    },
    {
      sharePrice: '193090443628222241',
      source: 'priceUpdate',
      timestamp: '1559343392',
    },
    {
      sharePrice: '195875560215668948',
      source: 'priceUpdate',
      timestamp: '1559415897',
    },
    {
      sharePrice: '195873826899159783',
      source: 'priceUpdate',
      timestamp: '1559429780',
    },
    {
      sharePrice: '204144572902105062',
      source: 'priceUpdate',
      timestamp: '1559516179',
    },
    {
      sharePrice: '196758589583712409',
      source: 'priceUpdate',
      timestamp: '1559602565',
    },
    {
      sharePrice: '196945263653558782',
      source: 'priceUpdate',
      timestamp: '1559737144',
    },
    {
      sharePrice: '194812646850181700',
      source: 'priceUpdate',
      timestamp: '1559823560',
    },
    {
      sharePrice: '194812637658901007',
      source: 'priceUpdate',
      timestamp: '1559823634',
    },
    {
      sharePrice: '194812524009957306',
      source: 'priceUpdate',
      timestamp: '1559824549',
    },
    {
      sharePrice: '196710372228501361',
      source: 'priceUpdate',
      timestamp: '1560023951',
    },
    {
      sharePrice: '157108596582815306',
      source: 'priceUpdate',
      timestamp: '1560225748',
    },
    {
      sharePrice: '157107218424583166',
      source: 'priceUpdate',
      timestamp: '1560239503',
    },
    {
      sharePrice: '163250751234768477',
      source: 'priceUpdate',
      timestamp: '1560325900',
    },
    {
      sharePrice: '151794984558328633',
      source: 'priceUpdate',
      timestamp: '1560412303',
    },
    {
      sharePrice: '153915293670828495',
      source: 'priceUpdate',
      timestamp: '1560498693',
    },
    {
      sharePrice: '149909517788786004',
      source: 'priceUpdate',
      timestamp: '1560585115',
    },
    {
      sharePrice: '147125638237629279',
      source: 'priceUpdate',
      timestamp: '1560753925',
    },
    {
      sharePrice: '145362158816865076',
      source: 'priceUpdate',
      timestamp: '1560754891',
    },
    {
      sharePrice: '145016045015163558',
      source: 'priceUpdate',
      timestamp: '1560841312',
    },
    {
      sharePrice: '143799421269971848',
      source: 'priceUpdate',
      timestamp: '1560927682',
    },
    {
      sharePrice: '133441075001235670',
      source: 'priceUpdate',
      timestamp: '1561014148',
    },
    {
      sharePrice: '128247789722176171',
      source: 'priceUpdate',
      timestamp: '1561100500',
    },
    {
      sharePrice: '123574050561197636',
      source: 'priceUpdate',
      timestamp: '1561186883',
    },
    {
      sharePrice: '117065264369969309',
      source: 'priceUpdate',
      timestamp: '1561273328',
    },
    {
      sharePrice: '117065086345019958',
      source: 'priceUpdate',
      timestamp: '1561275711',
    },
    {
      sharePrice: '120539557613608956',
      source: 'priceUpdate',
      timestamp: '1561333486',
    },
    {
      sharePrice: '113841064021769905',
      source: 'priceUpdate',
      timestamp: '1561419890',
    },
    {
      sharePrice: '112664544790382780',
      source: 'priceUpdate',
      timestamp: '1561506281',
    },
    {
      sharePrice: '108200158872761870',
      source: 'priceUpdate',
      timestamp: '1561632449',
    },
    {
      sharePrice: '99682192383235321',
      source: 'priceUpdate',
      timestamp: '1561839212',
    },
    {
      sharePrice: '99728054924026399',
      source: 'priceUpdate',
      timestamp: '1561897879',
    },
    {
      sharePrice: '100519272292974038',
      source: 'priceUpdate',
      timestamp: '1561947292',
    },
    {
      sharePrice: '106794227872373753',
      source: 'priceUpdate',
      timestamp: '1562033704',
    },
    {
      sharePrice: '97637063781258722',
      source: 'priceUpdate',
      timestamp: '1562078304',
    },
    {
      sharePrice: '116094818565231562',
      source: 'priceUpdate',
      timestamp: '1562166126',
    },
    {
      sharePrice: '104960981768180621',
      source: 'priceUpdate',
      timestamp: '1562252513',
    },
    {
      sharePrice: '102990618702425949',
      source: 'priceUpdate',
      timestamp: '1562338983',
    },
    {
      sharePrice: '101629981326696761',
      source: 'priceUpdate',
      timestamp: '1562511720',
    },
    {
      sharePrice: '103346717316320000',
      source: 'priceUpdate',
      timestamp: '1562598129',
    },
    {
      sharePrice: '100758041490267979',
      source: 'priceUpdate',
      timestamp: '1562684547',
    },
    {
      sharePrice: '103250276305263809',
      source: 'priceUpdate',
      timestamp: '1562787099',
    },
    {
      sharePrice: '103702901049839726',
      source: 'priceUpdate',
      timestamp: '1562873641',
    },
    {
      sharePrice: '102886846720558359',
      source: 'priceUpdate',
      timestamp: '1562959895',
    },
    {
      sharePrice: '100928592565673068',
      source: 'priceUpdate',
      timestamp: '1563046349',
    },
    {
      sharePrice: '100924028118644072',
      source: 'priceUpdate',
      timestamp: '1563117136',
    },
    {
      sharePrice: '100923620402558288',
      source: 'priceUpdate',
      timestamp: '1563123459',
    },
    {
      sharePrice: '103497062010161980',
      source: 'priceUpdate',
      timestamp: '1563209800',
    },
    {
      sharePrice: '131914882171632680',
      source: 'priceUpdate',
      timestamp: '1563312712',
    },
    {
      sharePrice: '136383855820641817',
      source: 'priceUpdate',
      timestamp: '1563398921',
    },
    {
      sharePrice: '169370226374254197',
      source: 'priceUpdate',
      timestamp: '1563485310',
    },
    {
      sharePrice: '178373979045954908',
      source: 'priceUpdate',
      timestamp: '1563571666',
    },
    {
      sharePrice: '224748714080619058',
      source: 'priceUpdate',
      timestamp: '1563658098',
    },
    {
      sharePrice: '106736829749802',
      source: 'priceUpdate',
      timestamp: '1563744517',
    },
    {
      sharePrice: '106734767788805',
      source: 'priceUpdate',
      timestamp: '1563774741',
    },
    {
      sharePrice: '164253879090417370',
      source: 'priceUpdate',
      timestamp: '1563784546',
    },
    {
      sharePrice: '212076931851574006',
      source: 'priceUpdate',
      timestamp: '1563803635',
    },
    {
      sharePrice: '182061444943864298',
      source: 'priceUpdate',
      timestamp: '1563959179',
    },
    {
      sharePrice: '186461334343020111',
      source: 'priceUpdate',
      timestamp: '1564045517',
    },
    {
      sharePrice: '183627492234424794',
      source: 'priceUpdate',
      timestamp: '1564209059',
    },
    {
      sharePrice: '181174561433246511',
      source: 'priceUpdate',
      timestamp: '1564299314',
    },
    {
      sharePrice: '184834924876139360',
      source: 'priceUpdate',
      timestamp: '1564385740',
    },
    {
      sharePrice: '200455724504830768',
      source: 'priceUpdate',
      timestamp: '1564473954',
    },
    {
      sharePrice: '194818596294438624',
      source: 'priceUpdate',
      timestamp: '1564645258',
    },
    {
      sharePrice: '198725991904936064',
      source: 'priceUpdate',
      timestamp: '1564731529',
    },
    {
      sharePrice: '205916028525534689',
      source: 'priceUpdate',
      timestamp: '1564817941',
    },
    {
      sharePrice: '214906588926193050',
      source: 'priceUpdate',
      timestamp: '1564998355',
    },
    {
      sharePrice: '217029117934185696',
      source: 'priceUpdate',
      timestamp: '1565084758',
    },
    {
      sharePrice: '214181572846281582',
      source: 'priceUpdate',
      timestamp: '1565177706',
    },
    {
      sharePrice: '214093247393429112',
      source: 'priceUpdate',
      timestamp: '1565264099',
    },
    {
      sharePrice: '190352186037915178',
      source: 'priceUpdate',
      timestamp: '1565350524',
    },
    {
      sharePrice: '187610338205953272',
      source: 'priceUpdate',
      timestamp: '1565523300',
    },
    {
      sharePrice: '184859379926685055',
      source: 'priceUpdate',
      timestamp: '1565609753',
    },
    {
      sharePrice: '186008782063344595',
      source: 'priceUpdate',
      timestamp: '1565782571',
    },
    {
      sharePrice: '183092036258384509',
      source: 'priceUpdate',
      timestamp: '1565977844',
    },
    {
      sharePrice: '183138689531991359',
      source: 'priceUpdate',
      timestamp: '1566164386',
    },
    {
      sharePrice: '183123322626582836',
      source: 'priceUpdate',
      timestamp: '1566295461',
    },
    {
      sharePrice: '182160038195605317',
      source: 'priceUpdate',
      timestamp: '1566381880',
    },
    {
      sharePrice: '182143726592024392',
      source: 'priceUpdate',
      timestamp: '1566521741',
    },
    {
      sharePrice: '182133656528893203',
      source: 'priceUpdate',
      timestamp: '1566608085',
    },
    {
      sharePrice: '177951489921466390',
      source: 'priceUpdate',
      timestamp: '1566811043',
    },
    {
      sharePrice: '177483397644913125',
      source: 'priceUpdate',
      timestamp: '1566897358',
    },
    {
      sharePrice: '180188513278478666',
      source: 'priceUpdate',
      timestamp: '1567006460',
    },
    {
      sharePrice: '170826308013771325',
      source: 'priceUpdate',
      timestamp: '1567094155',
    },
    {
      sharePrice: '182685256729127171',
      source: 'priceUpdate',
      timestamp: '1567180525',
    },
    {
      sharePrice: '175447718350096934',
      source: 'priceUpdate',
      timestamp: '1567353292',
    },
    {
      sharePrice: '175437999042722285',
      source: 'priceUpdate',
      timestamp: '1567439763',
    },
    {
      sharePrice: '177652116328360446',
      source: 'priceUpdate',
      timestamp: '1567526122',
    },
    {
      sharePrice: '177887223621026199',
      source: 'priceUpdate',
      timestamp: '1567612543',
    },
    {
      sharePrice: '182122188767392160',
      source: 'priceUpdate',
      timestamp: '1567779040',
    },
    {
      sharePrice: '182102021492969982',
      source: 'priceUpdate',
      timestamp: '1567951842',
    },
    {
      sharePrice: '176216300701791716',
      source: 'priceUpdate',
      timestamp: '1567981742',
    },
    {
      sharePrice: '174383809858378305',
      source: 'priceUpdate',
      timestamp: '1568103663',
    },
    {
      sharePrice: '180545150776249508',
      source: 'priceUpdate',
      timestamp: '1568153055',
    },
    {
      sharePrice: '177538992581823263',
      source: 'priceUpdate',
      timestamp: '1568188300',
    },
    {
      sharePrice: '176235469800799198',
      source: 'priceUpdate',
      timestamp: '1568273819',
    },
    {
      sharePrice: '175514857175123240',
      source: 'priceUpdate',
      timestamp: '1568375083',
    },
    {
      sharePrice: '161175266386018106',
      source: 'priceUpdate',
      timestamp: '1568460595',
    },
    {
      sharePrice: '163358335179287743',
      source: 'priceUpdate',
      timestamp: '1568556224',
    },
    {
      sharePrice: '164861228781670609',
      source: 'priceUpdate',
      timestamp: '1568659398',
    },
    {
      sharePrice: '168835919416406924',
      source: 'priceUpdate',
      timestamp: '1568755921',
    },
    {
      sharePrice: '167248145503007181',
      source: 'priceUpdate',
      timestamp: '1568924408',
    },
    {
      sharePrice: '175362060112817340',
      source: 'priceUpdate',
      timestamp: '1569010493',
    },
    {
      sharePrice: '171564129661911521',
      source: 'priceUpdate',
      timestamp: '1569095984',
    },
    {
      sharePrice: '168033486600689133',
      source: 'priceUpdate',
      timestamp: '1569183073',
    },
    {
      sharePrice: '168023885692775258',
      source: 'priceUpdate',
      timestamp: '1569272155',
    },
    {
      sharePrice: '168014626650557069',
      source: 'priceUpdate',
      timestamp: '1569358065',
    },
    {
      sharePrice: '166756190142765698',
      source: 'priceUpdate',
      timestamp: '1569443582',
    },
    {
      sharePrice: '164929857166717696',
      source: 'priceUpdate',
      timestamp: '1569531388',
    },
    {
      sharePrice: '169934557964256116',
      source: 'priceUpdate',
      timestamp: '1569616896',
    },
    {
      sharePrice: '168810340195787911',
      source: 'priceUpdate',
      timestamp: '1569790516',
    },
    {
      sharePrice: '160024184656676199',
      source: 'priceUpdate',
      timestamp: '1569876050',
    },
    {
      sharePrice: '162183807373291869',
      source: 'priceUpdate',
      timestamp: '1569961548',
    },
    {
      sharePrice: '162182764322880708',
      source: 'priceUpdate',
      timestamp: '1569971570',
    },
    {
      sharePrice: '162555014608767599',
      source: 'priceUpdate',
      timestamp: '1570057067',
    },
    {
      sharePrice: '168832524542037122',
      source: 'priceUpdate',
      timestamp: '1570142591',
    },
    {
      sharePrice: '174272051596871982',
      source: 'priceUpdate',
      timestamp: '1570228113',
    },
    {
      sharePrice: '174272048353151322',
      source: 'priceUpdate',
      timestamp: '1570228142',
    },
    {
      sharePrice: '169887555133777638',
      source: 'priceUpdate',
      timestamp: '1570313652',
    },
    {
      sharePrice: '169887553389068248',
      source: 'priceUpdate',
      timestamp: '1570313668',
    },
    {
      sharePrice: '173194573865026465',
      source: 'priceUpdate',
      timestamp: '1570399205',
    },
    {
      sharePrice: '163933102720696268',
      source: 'priceUpdate',
      timestamp: '1570522451',
    },
    {
      sharePrice: '166434900377509460',
      source: 'priceUpdate',
      timestamp: '1570607978',
    },
    {
      sharePrice: '166842444213943750',
      source: 'priceUpdate',
      timestamp: '1570662685',
    },
    {
      sharePrice: '171828986126322586',
      source: 'priceUpdate',
      timestamp: '1570748210',
    },
    {
      sharePrice: '172944574579997723',
      source: 'priceUpdate',
      timestamp: '1570833732',
    },
    {
      sharePrice: '171561224024841584',
      source: 'priceUpdate',
      timestamp: '1570919317',
    },
    {
      sharePrice: '175129469553320300',
      source: 'priceUpdate',
      timestamp: '1571004826',
    },
    {
      sharePrice: '175119853200255575',
      source: 'priceUpdate',
      timestamp: '1571090336',
    },
    {
      sharePrice: '196667360655958188',
      source: 'priceUpdate',
      timestamp: '1571175843',
    },
    {
      sharePrice: '188444514363195768',
      source: 'priceUpdate',
      timestamp: '1571261331',
    },
    {
      sharePrice: '189159332946829758',
      source: 'priceUpdate',
      timestamp: '1571347852',
    },
    {
      sharePrice: '189148943197065665',
      source: 'priceUpdate',
      timestamp: '1571433368',
    },
    {
      sharePrice: '189148939673716313',
      source: 'priceUpdate',
      timestamp: '1571433397',
    },
    {
      sharePrice: '182433186713666701',
      source: 'priceUpdate',
      timestamp: '1571518914',
    },
    {
      sharePrice: '182423162607273032',
      source: 'priceUpdate',
      timestamp: '1571604453',
    },
    {
      sharePrice: '185632391125925094',
      source: 'priceUpdate',
      timestamp: '1571689968',
    },
    {
      sharePrice: '185632385997930121',
      source: 'priceUpdate',
      timestamp: '1571690011',
    },
    {
      sharePrice: '187747685012056645',
      source: 'priceUpdate',
      timestamp: '1571775527',
    },
    {
      sharePrice: '185997298300008988',
      source: 'priceUpdate',
      timestamp: '1571861055',
    },
    {
      sharePrice: '182474084927514444',
      source: 'priceUpdate',
      timestamp: '1571946578',
    },
    {
      sharePrice: '187090431565714878',
      source: 'priceUpdate',
      timestamp: '1572032107',
    },
    {
      sharePrice: '197462959472584752',
      source: 'priceUpdate',
      timestamp: '1572117666',
    },
    {
      sharePrice: '197000162703440735',
      source: 'priceUpdate',
      timestamp: '1572203158',
    },
    {
      sharePrice: '196644891645947799',
      source: 'priceUpdate',
      timestamp: '1572288679',
    },
    {
      sharePrice: '202146526837947159',
      source: 'priceUpdate',
      timestamp: '1572374258',
    },
    {
      sharePrice: '204768865529310298',
      source: 'priceUpdate',
      timestamp: '1572460080',
    },
    {
      sharePrice: '203870757031300760',
      source: 'priceUpdate',
      timestamp: '1572545600',
    },
    {
      sharePrice: '208065107012362184',
      source: 'priceUpdate',
      timestamp: '1572631128',
    },
    {
      sharePrice: '214009458877827625',
      source: 'priceUpdate',
      timestamp: '1572716659',
    },
    {
      sharePrice: '207439274790110145',
      source: 'priceUpdate',
      timestamp: '1572802341',
    },
    {
      sharePrice: '199226706976583179',
      source: 'priceUpdate',
      timestamp: '1572887857',
    },
    {
      sharePrice: '199197752877598160',
      source: 'priceUpdate',
      timestamp: '1572973471',
    },
    {
      sharePrice: '196708212082496733',
      source: 'priceUpdate',
      timestamp: '1573058975',
    },
    {
      sharePrice: '196708203608177972',
      source: 'priceUpdate',
      timestamp: '1573059042',
    },
    {
      sharePrice: '187530149908780402',
      source: 'priceUpdate',
      timestamp: '1573142922',
    },
    {
      sharePrice: '187530099744408791',
      source: 'priceUpdate',
      timestamp: '1573143338',
    },
    {
      sharePrice: '194836493439044664',
      source: 'priceUpdate',
      timestamp: '1573228863',
    },
    {
      sharePrice: '195524212714173768',
      source: 'priceUpdate',
      timestamp: '1573314372',
    },
    {
      sharePrice: '183252853321226786',
      source: 'priceUpdate',
      timestamp: '1573497428',
    },
    {
      sharePrice: '183252852024724197',
      source: 'priceUpdate',
      timestamp: '1573497439',
    },
    {
      sharePrice: '183252846013666749',
      source: 'priceUpdate',
      timestamp: '1573497490',
    },
    {
      sharePrice: '183252845306483518',
      source: 'priceUpdate',
      timestamp: '1573497496',
    },
    {
      sharePrice: '183252841888431244',
      source: 'priceUpdate',
      timestamp: '1573497525',
    },
    {
      sharePrice: '183252841416975757',
      source: 'priceUpdate',
      timestamp: '1573497529',
    },
    {
      sharePrice: '183252841063384142',
      source: 'priceUpdate',
      timestamp: '1573497532',
    },
    {
      sharePrice: '183252840591928656',
      source: 'priceUpdate',
      timestamp: '1573497536',
    },
    {
      sharePrice: '183252839531153810',
      source: 'priceUpdate',
      timestamp: '1573497545',
    },
    {
      sharePrice: '183555653360574282',
      source: 'priceUpdate',
      timestamp: '1573657322',
    },
    {
      sharePrice: '183555525135720517',
      source: 'priceUpdate',
      timestamp: '1573658408',
    },
    {
      sharePrice: '183555517461120613',
      source: 'priceUpdate',
      timestamp: '1573658473',
    },
    {
      sharePrice: '183555510022662247',
      source: 'priceUpdate',
      timestamp: '1573658536',
    },
    {
      sharePrice: '183555506952822285',
      source: 'priceUpdate',
      timestamp: '1573658562',
    },
    {
      sharePrice: '183555504945619232',
      source: 'priceUpdate',
      timestamp: '1573658579',
    },
    {
      sharePrice: '183555491485551711',
      source: 'priceUpdate',
      timestamp: '1573658693',
    },
    {
      sharePrice: '183555465155770504',
      source: 'priceUpdate',
      timestamp: '1573658916',
    },
    {
      sharePrice: '183555394077168325',
      source: 'priceUpdate',
      timestamp: '1573659518',
    },
    {
      sharePrice: '183555386048356117',
      source: 'priceUpdate',
      timestamp: '1573659586',
    },
    {
      sharePrice: '183555321581716933',
      source: 'priceUpdate',
      timestamp: '1573660132',
    },
    {
      sharePrice: '183555318393806203',
      source: 'priceUpdate',
      timestamp: '1573660159',
    },
    {
      sharePrice: '183555303162677165',
      source: 'priceUpdate',
      timestamp: '1573660288',
    },
    {
      sharePrice: '183555257941573118',
      source: 'priceUpdate',
      timestamp: '1573660671',
    },
    {
      sharePrice: '183555249676619377',
      source: 'priceUpdate',
      timestamp: '1573660741',
    },
    {
      sharePrice: '185865246602920375',
      source: 'priceUpdate',
      timestamp: '1573746250',
    },
    {
      sharePrice: '184663673912613083',
      source: 'priceUpdate',
      timestamp: '1573831765',
    },
    {
      sharePrice: '188038736319086710',
      source: 'priceUpdate',
      timestamp: '1573918480',
    },
    {
      sharePrice: '188038735109338724',
      source: 'priceUpdate',
      timestamp: '1573918490',
    },
    {
      sharePrice: '186047268204556746',
      source: 'priceUpdate',
      timestamp: '1574040416',
    },
    {
      sharePrice: '186046948837013093',
      source: 'priceUpdate',
      timestamp: '1574043084',
    },
    {
      sharePrice: '186046947999092254',
      source: 'priceUpdate',
      timestamp: '1574043091',
    },
    {
      sharePrice: '183903204407831740',
      source: 'priceUpdate',
      timestamp: '1574111941',
    },
    {
      sharePrice: '183903056969984662',
      source: 'priceUpdate',
      timestamp: '1574113187',
    },
    {
      sharePrice: '183903044900433776',
      source: 'priceUpdate',
      timestamp: '1574113289',
    },
    {
      sharePrice: '183903030700962148',
      source: 'priceUpdate',
      timestamp: '1574113409',
    },
    {
      sharePrice: '183902952840526049',
      source: 'priceUpdate',
      timestamp: '1574114067',
    },
    {
      sharePrice: '183902951183921027',
      source: 'priceUpdate',
      timestamp: '1574114081',
    },
    {
      sharePrice: '183902926689832465',
      source: 'priceUpdate',
      timestamp: '1574114288',
    },
    {
      sharePrice: '183902864330486230',
      source: 'priceUpdate',
      timestamp: '1574114815',
    },
    {
      sharePrice: '183902853207566787',
      source: 'priceUpdate',
      timestamp: '1574114909',
    },
    {
      sharePrice: '183902843977910228',
      source: 'priceUpdate',
      timestamp: '1574114987',
    },
    {
      sharePrice: '183902821377084552',
      source: 'priceUpdate',
      timestamp: '1574115178',
    },
    {
      sharePrice: '183902754639567898',
      source: 'priceUpdate',
      timestamp: '1574115742',
    },
    {
      sharePrice: '183902734760307615',
      source: 'priceUpdate',
      timestamp: '1574115910',
    },
    {
      sharePrice: '193429867715349706',
      source: 'priceUpdate',
      timestamp: '1574176286',
    },
    {
      sharePrice: '193429825646575523',
      source: 'priceUpdate',
      timestamp: '1574176624',
    },
    {
      sharePrice: '190196283065635588',
      source: 'priceUpdate',
      timestamp: '1574271711',
    },
    {
      sharePrice: '190196278414790096',
      source: 'priceUpdate',
      timestamp: '1574271749',
    },
    {
      sharePrice: '190196267889192405',
      source: 'priceUpdate',
      timestamp: '1574271835',
    },
    {
      sharePrice: '190196248306685070',
      source: 'priceUpdate',
      timestamp: '1574271995',
    },
    {
      sharePrice: '190196243655839580',
      source: 'priceUpdate',
      timestamp: '1574272033',
    },
    {
      sharePrice: '190196241819979515',
      source: 'priceUpdate',
      timestamp: '1574272048',
    },
    {
      sharePrice: '190196237903478048',
      source: 'priceUpdate',
      timestamp: '1574272080',
    },
    {
      sharePrice: '192187549016706573',
      source: 'priceUpdate',
      timestamp: '1574358014',
    },
    {
      sharePrice: '190868854001701721',
      source: 'priceUpdate',
      timestamp: '1574443522',
    },
    {
      sharePrice: '190379693359304726',
      source: 'priceUpdate',
      timestamp: '1574529399',
    },
    {
      sharePrice: '190379692991717690',
      source: 'priceUpdate',
      timestamp: '1574529402',
    },
    {
      sharePrice: '188630888956387329',
      source: 'priceUpdate',
      timestamp: '1574614931',
    },
    {
      sharePrice: '191233206953146246',
      source: 'priceUpdate',
      timestamp: '1574687748',
    },
    {
      sharePrice: '191860752353141329',
      source: 'priceUpdate',
      timestamp: '1574773398',
    },
    {
      sharePrice: '192416287880732699',
      source: 'priceUpdate',
      timestamp: '1574858901',
    },
    {
      sharePrice: '197266116416915897',
      source: 'priceUpdate',
      timestamp: '1574944400',
    },
    {
      sharePrice: '197409968295600798',
      source: 'priceUpdate',
      timestamp: '1575031847',
    },
    {
      sharePrice: '201746273781638269',
      source: 'priceUpdate',
      timestamp: '1575117684',
    },
    {
      sharePrice: '195614627570934053',
      source: 'priceUpdate',
      timestamp: '1575203207',
    },
    {
      sharePrice: '192076480681628058',
      source: 'priceUpdate',
      timestamp: '1575224304',
    },
    {
      sharePrice: '192076451865030552',
      source: 'priceUpdate',
      timestamp: '1575224537',
    },
    {
      sharePrice: '192076393613453621',
      source: 'priceUpdate',
      timestamp: '1575225008',
    },
    {
      sharePrice: '192076301350871053',
      source: 'priceUpdate',
      timestamp: '1575225754',
    },
    {
      sharePrice: '194500281786055917',
      source: 'priceUpdate',
      timestamp: '1575282870',
    },
    {
      sharePrice: '0',
      source: 'priceUpdate',
      timestamp: '1575374273',
    },
    {
      sharePrice: '0',
      source: 'priceUpdate',
      timestamp: '1575459963',
    },
    {
      sharePrice: '0',
      source: 'priceUpdate',
      timestamp: '1575543687',
    },
    {
      sharePrice: '156329760278911512',
      source: 'priceUpdate',
      timestamp: '1576140672',
    },
    {
      sharePrice: '161314064130768621',
      source: 'priceUpdate',
      timestamp: '1576237706',
    },
    {
      sharePrice: '160448429711794043',
      source: 'priceUpdate',
      timestamp: '1576331421',
    },
    {
      sharePrice: '164523608340964195',
      source: 'priceUpdate',
      timestamp: '1576416925',
    },
    {
      sharePrice: '163868286549506718',
      source: 'priceUpdate',
      timestamp: '1576502536',
    },
    {
      sharePrice: '163082152392778521',
      source: 'priceUpdate',
      timestamp: '1576588054',
    },
    {
      sharePrice: '154745242753780136',
      source: 'priceUpdate',
      timestamp: '1576673740',
    },
    {
      sharePrice: '154889830785769562',
      source: 'priceUpdate',
      timestamp: '1576759272',
    },
    {
      sharePrice: '155742331171961693',
      source: 'priceUpdate',
      timestamp: '1576844838',
    },
    {
      sharePrice: '159185256266819970',
      source: 'priceUpdate',
      timestamp: '1576930500',
    },
    {
      sharePrice: '166990569177903601',
      source: 'priceUpdate',
      timestamp: '1577016136',
    },
    {
      sharePrice: '171352988966240116',
      source: 'priceUpdate',
      timestamp: '1577101684',
    },
    {
      sharePrice: '178225111481611470',
      source: 'priceUpdate',
      timestamp: '1577187202',
    },
    {
      sharePrice: '181281515093915384',
      source: 'priceUpdate',
      timestamp: '1577273398',
    },
    {
      sharePrice: '181434578165766077',
      source: 'priceUpdate',
      timestamp: '1577358901',
    },
    {
      sharePrice: '178153167238402016',
      source: 'priceUpdate',
      timestamp: '1577444528',
    },
    {
      sharePrice: '186365235091040830',
      source: 'priceUpdate',
      timestamp: '1577530244',
    },
    {
      sharePrice: '188011427945572017',
      source: 'priceUpdate',
      timestamp: '1577615857',
    },
    {
      sharePrice: '192815855232043999',
      source: 'priceUpdate',
      timestamp: '1577701366',
    },
    {
      sharePrice: '193205286064728806',
      source: 'priceUpdate',
      timestamp: '1577786902',
    },
    {
      sharePrice: '193343310662220250',
      source: 'priceUpdate',
      timestamp: '1577872436',
    },
    {
      sharePrice: '193534683947213999',
      source: 'priceUpdate',
      timestamp: '1577957967',
    },
    {
      sharePrice: '194009351881896476',
      source: 'priceUpdate',
      timestamp: '1578043519',
    },
    {
      sharePrice: '190358041180258615',
      source: 'priceUpdate',
      timestamp: '1578129128',
    },
    {
      sharePrice: '202028235449810960',
      source: 'priceUpdate',
      timestamp: '1578214636',
    },
    {
      sharePrice: '196355244396446404',
      source: 'priceUpdate',
      timestamp: '1578300372',
    },
    {
      sharePrice: '193592082092519221',
      source: 'priceUpdate',
      timestamp: '1578386250',
    },
    {
      sharePrice: '195775736277778677',
      source: 'priceUpdate',
      timestamp: '1578471859',
    },
    {
      sharePrice: '195568674655154848',
      source: 'priceUpdate',
      timestamp: '1578557375',
    },
    {
      sharePrice: '195616503183645609',
      source: 'priceUpdate',
      timestamp: '1578642880',
    },
    {
      sharePrice: '203104572482872151',
      source: 'priceUpdate',
      timestamp: '1578659307',
    },
    {
      sharePrice: '198305189866532443',
      source: 'priceUpdate',
      timestamp: '1578744878',
    },
    {
      sharePrice: '198294245392644907',
      source: 'priceUpdate',
      timestamp: '1578830397',
    },
    {
      sharePrice: '194283796432190638',
      source: 'priceUpdate',
      timestamp: '1578916307',
    },
    {
      sharePrice: '199848884762834648',
      source: 'priceUpdate',
      timestamp: '1579001820',
    },
    {
      sharePrice: '197049582534489228',
      source: 'priceUpdate',
      timestamp: '1579087328',
    },
    {
      sharePrice: '196713983904109604',
      source: 'priceUpdate',
      timestamp: '1579172849',
    },
    {
      sharePrice: '192998378835450118',
      source: 'priceUpdate',
      timestamp: '1579258372',
    },
    {
      sharePrice: '203590915286733844',
      source: 'priceUpdate',
      timestamp: '1579343959',
    },
    {
      sharePrice: '194512365423347463',
      source: 'priceUpdate',
      timestamp: '1579429474',
    },
    {
      sharePrice: '201426141389659050',
      source: 'priceUpdate',
      timestamp: '1579516021',
    },
    {
      sharePrice: '201426129294456042',
      source: 'priceUpdate',
      timestamp: '1579516114',
    },
    {
      sharePrice: '203548819766559602',
      source: 'priceUpdate',
      timestamp: '1579601631',
    },
    {
      sharePrice: '210401357291690916',
      source: 'priceUpdate',
      timestamp: '1579687329',
    },
    {
      sharePrice: '249157287410335647',
      source: 'priceUpdate',
      timestamp: '1579772912',
    },
    {
      sharePrice: '105637481436021',
      source: 'priceUpdate',
      timestamp: '1579858645',
    },
    {
      sharePrice: '105631645671606',
      source: 'priceUpdate',
      timestamp: '1579944185',
    },
    {
      sharePrice: '105625796944890',
      source: 'priceUpdate',
      timestamp: '1580029915',
    },
    {
      sharePrice: '299460558280206263',
      source: 'priceUpdate',
      timestamp: '1580115433',
    },
    {
      sharePrice: '291759315596420627',
      source: 'priceUpdate',
      timestamp: '1580129455',
    },
    {
      sharePrice: '281603805174429306',
      source: 'priceUpdate',
      timestamp: '1580214967',
    },
    {
      sharePrice: '273897993667338475',
      source: 'priceUpdate',
      timestamp: '1580300501',
    },
    {
      sharePrice: '273897988005294423',
      source: 'priceUpdate',
      timestamp: '1580300533',
    },
    {
      sharePrice: '282249984349767948',
      source: 'priceUpdate',
      timestamp: '1580386590',
    },
    {
      sharePrice: '256464693283975740',
      source: 'priceUpdate',
      timestamp: '1580472125',
    },
    {
      sharePrice: '252634341098583120',
      source: 'priceUpdate',
      timestamp: '1580558843',
    },
    {
      sharePrice: '242750908904286670',
      source: 'priceUpdate',
      timestamp: '1580644393',
    },
    {
      sharePrice: '231336716981385485',
      source: 'priceUpdate',
      timestamp: '1580729952',
    },
    {
      sharePrice: '228916826787690745',
      source: 'priceUpdate',
      timestamp: '1580839448',
    },
    {
      sharePrice: '228916540538457570',
      source: 'priceUpdate',
      timestamp: '1580841383',
    },
    {
      sharePrice: '228916465388788085',
      source: 'priceUpdate',
      timestamp: '1580841891',
    },
    {
      sharePrice: '221343214015136103',
      source: 'priceUpdate',
      timestamp: '1581003895',
    },
    {
      sharePrice: '221343212012389296',
      source: 'priceUpdate',
      timestamp: '1581003909',
    },
    {
      sharePrice: '212966166013523279',
      source: 'priceUpdate',
      timestamp: '1581089803',
    },
    {
      sharePrice: '210481266378090647',
      source: 'priceUpdate',
      timestamp: '1581134976',
    },
    {
      sharePrice: '210481262160700918',
      source: 'priceUpdate',
      timestamp: '1581135007',
    },
    {
      sharePrice: '210480604519992731',
      source: 'priceUpdate',
      timestamp: '1581139841',
    },
    {
      sharePrice: '210480589146926941',
      source: 'priceUpdate',
      timestamp: '1581139954',
    },
    {
      sharePrice: '212591804685475512',
      source: 'priceUpdate',
      timestamp: '1581225521',
    },
    {
      sharePrice: '210021608627574003',
      source: 'priceUpdate',
      timestamp: '1581311132',
    },
    {
      sharePrice: '210938884378764419',
      source: 'priceUpdate',
      timestamp: '1581396684',
    },
    {
      sharePrice: '197697987727342047',
      source: 'priceUpdate',
      timestamp: '1581482251',
    },
    {
      sharePrice: '197697985554554530',
      source: 'priceUpdate',
      timestamp: '1581482268',
    },
    {
      sharePrice: '189108476667137469',
      source: 'priceUpdate',
      timestamp: '1581567859',
    },
    {
      sharePrice: '195923184052183796',
      source: 'priceUpdate',
      timestamp: '1581653357',
    },
    {
      sharePrice: '187033497186944953',
      source: 'priceUpdate',
      timestamp: '1581738872',
    },
    {
      sharePrice: '185197954840976461',
      source: 'priceUpdate',
      timestamp: '1581824385',
    },
    {
      sharePrice: '186359772371850861',
      source: 'priceUpdate',
      timestamp: '1581897328',
    },
    {
      sharePrice: '175436769257663472',
      source: 'priceUpdate',
      timestamp: '1581982860',
    },
    {
      sharePrice: '172202999221039158',
      source: 'priceUpdate',
      timestamp: '1582070168',
    },
    {
      sharePrice: '161455689810129494',
      source: 'priceUpdate',
      timestamp: '1582157578',
    },
    {
      sharePrice: '164913431544290899',
      source: 'priceUpdate',
      timestamp: '1582244889',
    },
    {
      sharePrice: '161836110545728390',
      source: 'priceUpdate',
      timestamp: '1582281970',
    },
    {
      sharePrice: '167814753677860396',
      source: 'priceUpdate',
      timestamp: '1582372882',
    },
    {
      sharePrice: '161645303683353963',
      source: 'priceUpdate',
      timestamp: '1582460198',
    },
    {
      sharePrice: '162069399969937744',
      source: 'priceUpdate',
      timestamp: '1582547600',
    },
    {
      sharePrice: '152417646870206846',
      source: 'priceUpdate',
      timestamp: '1582591183',
    },
    {
      sharePrice: '149431485659744299',
      source: 'priceUpdate',
      timestamp: '1582620126',
    },
    {
      sharePrice: '149431482372691216',
      source: 'priceUpdate',
      timestamp: '1582620160',
    },
    {
      sharePrice: '149431467774308413',
      source: 'priceUpdate',
      timestamp: '1582620311',
    },
    {
      sharePrice: '168004123436641026',
      source: 'priceUpdate',
      timestamp: '1582706461',
    },
    {
      sharePrice: '155105876973414527',
      source: 'priceUpdate',
      timestamp: '1582791986',
    },
    {
      sharePrice: '150039796357214055',
      source: 'priceUpdate',
      timestamp: '1582879322',
    },
    {
      sharePrice: '153183566654355183',
      source: 'priceUpdate',
      timestamp: '1582966666',
    },
    {
      sharePrice: '159080349231351001',
      source: 'priceUpdate',
      timestamp: '1583054001',
    },
    {
      sharePrice: '156158707686449551',
      source: 'priceUpdate',
      timestamp: '1583141313',
    },
    {
      sharePrice: '152685669729727835',
      source: 'priceUpdate',
      timestamp: '1583226834',
    },
    {
      sharePrice: '159184127414074558',
      source: 'priceUpdate',
      timestamp: '1583312357',
    },
    {
      sharePrice: '161340742884640735',
      source: 'priceUpdate',
      timestamp: '1583397898',
    },
    {
      sharePrice: '158325362596051592',
      source: 'priceUpdate',
      timestamp: '1583483478',
    },
    {
      sharePrice: '158860433897263016',
      source: 'priceUpdate',
      timestamp: '1583519098',
    },
    {
      sharePrice: '158860432251853228',
      source: 'priceUpdate',
      timestamp: '1583519114',
    },
    {
      sharePrice: '158860254650434147',
      source: 'priceUpdate',
      timestamp: '1583520841',
    },
    {
      sharePrice: '158896950248180114',
      source: 'priceUpdate',
      timestamp: '1583521838',
    },
    {
      sharePrice: '164668347680924097',
      source: 'priceUpdate',
      timestamp: '1583585773',
    },
    {
      sharePrice: '162088846956797669',
      source: 'priceUpdate',
      timestamp: '1583676639',
    },
    {
      sharePrice: '163595423483283462',
      source: 'priceUpdate',
      timestamp: '1583741185',
    },
    {
      sharePrice: '160109833357372940',
      source: 'priceUpdate',
      timestamp: '1583828520',
    },
    {
      sharePrice: '161162063322067788',
      source: 'priceUpdate',
      timestamp: '1583914099',
    },
    {
      sharePrice: '163052979731122686',
      source: 'priceUpdate',
      timestamp: '1584038611',
    },
    {
      sharePrice: '158075518780315707',
      source: 'priceUpdate',
      timestamp: '1584099309',
    },
    {
      sharePrice: '163066966915026098',
      source: 'priceUpdate',
      timestamp: '1584172807',
    },
    {
      sharePrice: '166216225567939366',
      source: 'priceUpdate',
      timestamp: '1584259206',
    },
    {
      sharePrice: '164657304751931799',
      source: 'priceUpdate',
      timestamp: '1584345795',
    },
    {
      sharePrice: '161342039502127013',
      source: 'priceUpdate',
      timestamp: '1584375749',
    },
    {
      sharePrice: '166978219160301012',
      source: 'priceUpdate',
      timestamp: '1584382373',
    },
    {
      sharePrice: '170432995742460453',
      source: 'priceUpdate',
      timestamp: '1584432187',
    },
    {
      sharePrice: '172553994276538316',
      source: 'priceUpdate',
      timestamp: '1584518449',
    },
    {
      sharePrice: '161923233592281691',
      source: 'priceUpdate',
      timestamp: '1584604810',
    },
    {
      sharePrice: '169956537306739295',
      source: 'priceUpdate',
      timestamp: '1584700996',
    },
    {
      sharePrice: '166337426141174349',
      source: 'priceUpdate',
      timestamp: '1584763951',
    },
    {
      sharePrice: '166421155058550949',
      source: 'priceUpdate',
      timestamp: '1584850240',
    },
    {
      sharePrice: '172339259087273022',
      source: 'priceUpdate',
      timestamp: '1584936633',
    },
    {
      sharePrice: '168985252980582313',
      source: 'priceUpdate',
      timestamp: '1585050294',
    },
    {
      sharePrice: '169870995523220032',
      source: 'priceUpdate',
      timestamp: '1585123207',
    },
    {
      sharePrice: '172993279420639225',
      source: 'priceUpdate',
      timestamp: '1585209692',
    },
    {
      sharePrice: '175049708102896614',
      source: 'priceUpdate',
      timestamp: '1585296023',
    },
    {
      sharePrice: '173203801310733129',
      source: 'priceUpdate',
      timestamp: '1585382404',
    },
    {
      sharePrice: '170079405366920628',
      source: 'priceUpdate',
      timestamp: '1585468828',
    },
    {
      sharePrice: '173458898493066542',
      source: 'priceUpdate',
      timestamp: '1585555302',
    },
    {
      sharePrice: '166876725271618656',
      source: 'priceUpdate',
      timestamp: '1585641733',
    },
    {
      sharePrice: '169033940170867761',
      source: 'priceUpdate',
      timestamp: '1585728145',
    },
    {
      sharePrice: '164463335276698128',
      source: 'priceUpdate',
      timestamp: '1585814563',
    },
    {
      sharePrice: '156637693747044845',
      source: 'priceUpdate',
      timestamp: '1585900920',
    },
  ],
  createdAt: '1551480763',
  name: 'HelloFund',
};

const ag = {
  calculationsHistory: [
    {
      sharePrice: '960456536406204017',
      source: 'priceUpdate',
      timestamp: '1563485310',
    },
    {
      sharePrice: '1015937139061020375',
      source: 'priceUpdate',
      timestamp: '1563571666',
    },
    {
      sharePrice: '1023468270787946061',
      source: 'priceUpdate',
      timestamp: '1563658098',
    },
    {
      sharePrice: '1022958481877218566',
      source: 'priceUpdate',
      timestamp: '1563744517',
    },
    {
      sharePrice: '1019757947724187429',
      source: 'priceUpdate',
      timestamp: '1563774741',
    },
    {
      sharePrice: '1021099757663342968',
      source: 'priceUpdate',
      timestamp: '1563784546',
    },
    {
      sharePrice: '1021489045132584555',
      source: 'priceUpdate',
      timestamp: '1563803635',
    },
    {
      sharePrice: '1023405852974302035',
      source: 'priceUpdate',
      timestamp: '1563959179',
    },
    {
      sharePrice: '1012530271061761390',
      source: 'priceUpdate',
      timestamp: '1564045517',
    },
    {
      sharePrice: '1077244773868273829',
      source: 'priceUpdate',
      timestamp: '1564209059',
    },
    {
      sharePrice: '1069824918418058842',
      source: 'priceUpdate',
      timestamp: '1564299314',
    },
    {
      sharePrice: '1119670971094030648',
      source: 'priceUpdate',
      timestamp: '1564385740',
    },
    {
      sharePrice: '1154431599918211076',
      source: 'priceUpdate',
      timestamp: '1564473954',
    },
    {
      sharePrice: '1068752075873474489',
      source: 'priceUpdate',
      timestamp: '1564645258',
    },
    {
      sharePrice: '1022891652099962956',
      source: 'priceUpdate',
      timestamp: '1564731529',
    },
    {
      sharePrice: '1005012655374809985',
      source: 'priceUpdate',
      timestamp: '1564817941',
    },
    {
      sharePrice: '990418902978899553',
      source: 'priceUpdate',
      timestamp: '1564998355',
    },
    {
      sharePrice: '925382310544994741',
      source: 'priceUpdate',
      timestamp: '1565084758',
    },
    {
      sharePrice: '948151838265962653',
      source: 'priceUpdate',
      timestamp: '1565177706',
    },
    {
      sharePrice: '914793451073882740',
      source: 'priceUpdate',
      timestamp: '1565264099',
    },
    {
      sharePrice: '935981045228502292',
      source: 'priceUpdate',
      timestamp: '1565350524',
    },
    {
      sharePrice: '949756703868035725',
      source: 'priceUpdate',
      timestamp: '1565523300',
    },
    {
      sharePrice: '960235702139293705',
      source: 'priceUpdate',
      timestamp: '1565609753',
    },
    {
      sharePrice: '927464122171237088',
      source: 'priceUpdate',
      timestamp: '1565782571',
    },
    {
      sharePrice: '996360758603186283',
      source: 'priceUpdate',
      timestamp: '1565977844',
    },
    {
      sharePrice: '978993608502431292',
      source: 'priceUpdate',
      timestamp: '1566164386',
    },
    {
      sharePrice: '937480294623241085',
      source: 'priceUpdate',
      timestamp: '1566295461',
    },
    {
      sharePrice: '1047505699420994870',
      source: 'priceUpdate',
      timestamp: '1566381880',
    },
    {
      sharePrice: '1201918017568984249',
      source: 'priceUpdate',
      timestamp: '1566521741',
    },
    {
      sharePrice: '1172022072367023606',
      source: 'priceUpdate',
      timestamp: '1566608085',
    },
    {
      sharePrice: '1190380975359944251',
      source: 'priceUpdate',
      timestamp: '1566811043',
    },
    {
      sharePrice: '1162743254093131572',
      source: 'priceUpdate',
      timestamp: '1566897358',
    },
    {
      sharePrice: '1121037466853259082',
      source: 'priceUpdate',
      timestamp: '1567006460',
    },
    {
      sharePrice: '1123328486144321496',
      source: 'priceUpdate',
      timestamp: '1567094155',
    },
    {
      sharePrice: '1143205455158439934',
      source: 'priceUpdate',
      timestamp: '1567180525',
    },
    {
      sharePrice: '1140596835045630630',
      source: 'priceUpdate',
      timestamp: '1567353292',
    },
    {
      sharePrice: '1133706402862565174',
      source: 'priceUpdate',
      timestamp: '1567439763',
    },
    {
      sharePrice: '1075779332190758636',
      source: 'priceUpdate',
      timestamp: '1567526122',
    },
    {
      sharePrice: '1094861090750449867',
      source: 'priceUpdate',
      timestamp: '1567612543',
    },
    {
      sharePrice: '1260901702808387564',
      source: 'priceUpdate',
      timestamp: '1567779040',
    },
    {
      sharePrice: '1170413184415510058',
      source: 'priceUpdate',
      timestamp: '1567951842',
    },
    {
      sharePrice: '1206633620928509069',
      source: 'priceUpdate',
      timestamp: '1567981742',
    },
    {
      sharePrice: '1178099856139095137',
      source: 'priceUpdate',
      timestamp: '1568103663',
    },
    {
      sharePrice: '1200678576460664483',
      source: 'priceUpdate',
      timestamp: '1568153055',
    },
    {
      sharePrice: '1265681229958036809',
      source: 'priceUpdate',
      timestamp: '1568188300',
    },
    {
      sharePrice: '1393477180660276030',
      source: 'priceUpdate',
      timestamp: '1568273819',
    },
    {
      sharePrice: '1265862638315544339',
      source: 'priceUpdate',
      timestamp: '1568375083',
    },
    {
      sharePrice: '1346223517039514545',
      source: 'priceUpdate',
      timestamp: '1568460595',
    },
    {
      sharePrice: '1366421798601888722',
      source: 'priceUpdate',
      timestamp: '1568556224',
    },
    {
      sharePrice: '1270345004127557446',
      source: 'priceUpdate',
      timestamp: '1568659398',
    },
    {
      sharePrice: '1309731018513740049',
      source: 'priceUpdate',
      timestamp: '1568755921',
    },
    {
      sharePrice: '1225809719058207570',
      source: 'priceUpdate',
      timestamp: '1568924408',
    },
    {
      sharePrice: '1246589710485660892',
      source: 'priceUpdate',
      timestamp: '1569010493',
    },
    {
      sharePrice: '1169877916129466703',
      source: 'priceUpdate',
      timestamp: '1569095984',
    },
    {
      sharePrice: '1168431486800294550',
      source: 'priceUpdate',
      timestamp: '1569183073',
    },
    {
      sharePrice: '1181814040892682448',
      source: 'priceUpdate',
      timestamp: '1569272155',
    },
    {
      sharePrice: '1202588935958678716',
      source: 'priceUpdate',
      timestamp: '1569358065',
    },
    {
      sharePrice: '1162370495838212126',
      source: 'priceUpdate',
      timestamp: '1569443582',
    },
    {
      sharePrice: '1224614648997777149',
      source: 'priceUpdate',
      timestamp: '1569531388',
    },
    {
      sharePrice: '1251994526429781245',
      source: 'priceUpdate',
      timestamp: '1569616896',
    },
    {
      sharePrice: '1224170885205665169',
      source: 'priceUpdate',
      timestamp: '1569790516',
    },
    {
      sharePrice: '1267615156656243294',
      source: 'priceUpdate',
      timestamp: '1569876050',
    },
    {
      sharePrice: '1225721236155586158',
      source: 'priceUpdate',
      timestamp: '1569961548',
    },
    {
      sharePrice: '1235615282229591254',
      source: 'priceUpdate',
      timestamp: '1569971570',
    },
    {
      sharePrice: '1234802212191476903',
      source: 'priceUpdate',
      timestamp: '1570057067',
    },
    {
      sharePrice: '1253776792005664735',
      source: 'priceUpdate',
      timestamp: '1570142591',
    },
    {
      sharePrice: '1292134064830949111',
      source: 'priceUpdate',
      timestamp: '1570228113',
    },
    {
      sharePrice: '1291671450102735399',
      source: 'priceUpdate',
      timestamp: '1570228142',
    },
    {
      sharePrice: '1330597618365010622',
      source: 'priceUpdate',
      timestamp: '1570313652',
    },
    {
      sharePrice: '1330597611781938090',
      source: 'priceUpdate',
      timestamp: '1570313668',
    },
    {
      sharePrice: '1271490543883488092',
      source: 'priceUpdate',
      timestamp: '1570399205',
    },
    {
      sharePrice: '1267939981788398606',
      source: 'priceUpdate',
      timestamp: '1570522451',
    },
    {
      sharePrice: '1311284975100888290',
      source: 'priceUpdate',
      timestamp: '1570607978',
    },
    {
      sharePrice: '1202323027821813844',
      source: 'priceUpdate',
      timestamp: '1570662685',
    },
    {
      sharePrice: '1220168937974345906',
      source: 'priceUpdate',
      timestamp: '1570748210',
    },
    {
      sharePrice: '1226134873909156404',
      source: 'priceUpdate',
      timestamp: '1570833732',
    },
    {
      sharePrice: '1276570485370138284',
      source: 'priceUpdate',
      timestamp: '1570919317',
    },
    {
      sharePrice: '1256219477840288762',
      source: 'priceUpdate',
      timestamp: '1571004826',
    },
    {
      sharePrice: '1256568686977266931',
      source: 'priceUpdate',
      timestamp: '1571090336',
    },
    {
      sharePrice: '1293641707046497772',
      source: 'priceUpdate',
      timestamp: '1571175843',
    },
    {
      sharePrice: '1235923606155668282',
      source: 'priceUpdate',
      timestamp: '1571261331',
    },
    {
      sharePrice: '1264535897965784482',
      source: 'priceUpdate',
      timestamp: '1571347852',
    },
    {
      sharePrice: '1256604653050717760',
      source: 'priceUpdate',
      timestamp: '1571433368',
    },
    {
      sharePrice: '1256604641724704049',
      source: 'priceUpdate',
      timestamp: '1571433397',
    },
    {
      sharePrice: '1264729975410874106',
      source: 'priceUpdate',
      timestamp: '1571518914',
    },
    {
      sharePrice: '1224995034948470130',
      source: 'priceUpdate',
      timestamp: '1571604453',
    },
    {
      sharePrice: '1211796727379156174',
      source: 'priceUpdate',
      timestamp: '1571689968',
    },
    {
      sharePrice: '1211796711131345892',
      source: 'priceUpdate',
      timestamp: '1571690011',
    },
    {
      sharePrice: '1189594952378773411',
      source: 'priceUpdate',
      timestamp: '1571775527',
    },
    {
      sharePrice: '1181037805468251189',
      source: 'priceUpdate',
      timestamp: '1571861055',
    },
    {
      sharePrice: '1208696503323485662',
      source: 'priceUpdate',
      timestamp: '1571946578',
    },
    {
      sharePrice: '1163001047760722022',
      source: 'priceUpdate',
      timestamp: '1572032107',
    },
    {
      sharePrice: '1154219983562824017',
      source: 'priceUpdate',
      timestamp: '1572117666',
    },
    {
      sharePrice: '1165917153065127174',
      source: 'priceUpdate',
      timestamp: '1572203158',
    },
    {
      sharePrice: '1192893285409244992',
      source: 'priceUpdate',
      timestamp: '1572288679',
    },
    {
      sharePrice: '1164884697323637641',
      source: 'priceUpdate',
      timestamp: '1572374258',
    },
    {
      sharePrice: '1133688081010780755',
      source: 'priceUpdate',
      timestamp: '1572460080',
    },
    {
      sharePrice: '1145693591993975761',
      source: 'priceUpdate',
      timestamp: '1572545600',
    },
    {
      sharePrice: '1158755976305834501',
      source: 'priceUpdate',
      timestamp: '1572631128',
    },
    {
      sharePrice: '1157876241692944583',
      source: 'priceUpdate',
      timestamp: '1572716659',
    },
    {
      sharePrice: '1157004244480871409',
      source: 'priceUpdate',
      timestamp: '1572802341',
    },
    {
      sharePrice: '1162049329205492526',
      source: 'priceUpdate',
      timestamp: '1572887857',
    },
    {
      sharePrice: '1147910826684984898',
      source: 'priceUpdate',
      timestamp: '1572973471',
    },
    {
      sharePrice: '1124932560125652813',
      source: 'priceUpdate',
      timestamp: '1573058975',
    },
    {
      sharePrice: '1124932536451140152',
      source: 'priceUpdate',
      timestamp: '1573059042',
    },
    {
      sharePrice: '1132219254172354274',
      source: 'priceUpdate',
      timestamp: '1573142922',
    },
    {
      sharePrice: '1131710931795220918',
      source: 'priceUpdate',
      timestamp: '1573143338',
    },
    {
      sharePrice: '1102658272515241619',
      source: 'priceUpdate',
      timestamp: '1573228863',
    },
    {
      sharePrice: '1118438012789139014',
      source: 'priceUpdate',
      timestamp: '1573314372',
    },
    {
      sharePrice: '1161857722192947768',
      source: 'priceUpdate',
      timestamp: '1573497428',
    },
    {
      sharePrice: '1161857718190316698',
      source: 'priceUpdate',
      timestamp: '1573497439',
    },
    {
      sharePrice: '1160313047583843063',
      source: 'priceUpdate',
      timestamp: '1573497490',
    },
    {
      sharePrice: '1160797034796346503',
      source: 'priceUpdate',
      timestamp: '1573497496',
    },
    {
      sharePrice: '1160797024252687511',
      source: 'priceUpdate',
      timestamp: '1573497525',
    },
    {
      sharePrice: '1160797022798389750',
      source: 'priceUpdate',
      timestamp: '1573497529',
    },
    {
      sharePrice: '1160313032319487124',
      source: 'priceUpdate',
      timestamp: '1573497532',
    },
    {
      sharePrice: '1160797020253368677',
      source: 'priceUpdate',
      timestamp: '1573497536',
    },
    {
      sharePrice: '1160313027594805491',
      source: 'priceUpdate',
      timestamp: '1573497545',
    },
    {
      sharePrice: '1182951424142176385',
      source: 'priceUpdate',
      timestamp: '1573657322',
    },
    {
      sharePrice: '1181334002183510871',
      source: 'priceUpdate',
      timestamp: '1573658408',
    },
    {
      sharePrice: '1181333978171007908',
      source: 'priceUpdate',
      timestamp: '1573658473',
    },
    {
      sharePrice: '1181333954897351018',
      source: 'priceUpdate',
      timestamp: '1573658536',
    },
    {
      sharePrice: '1181333945292349790',
      source: 'priceUpdate',
      timestamp: '1573658562',
    },
    {
      sharePrice: '1181333939012156764',
      source: 'priceUpdate',
      timestamp: '1573658579',
    },
    {
      sharePrice: '1181333896897920588',
      source: 'priceUpdate',
      timestamp: '1573658693',
    },
    {
      sharePrice: '1183963119230629606',
      source: 'priceUpdate',
      timestamp: '1573658916',
    },
    {
      sharePrice: '1182415212769700360',
      source: 'priceUpdate',
      timestamp: '1573659518',
    },
    {
      sharePrice: '1182415187628039311',
      source: 'priceUpdate',
      timestamp: '1573659586',
    },
    {
      sharePrice: '1179769978249524583',
      source: 'priceUpdate',
      timestamp: '1573660132',
    },
    {
      sharePrice: '1179769968287087822',
      source: 'priceUpdate',
      timestamp: '1573660159',
    },
    {
      sharePrice: '1179236624312370061',
      source: 'priceUpdate',
      timestamp: '1573660288',
    },
    {
      sharePrice: '1179173071732738921',
      source: 'priceUpdate',
      timestamp: '1573660671',
    },
    {
      sharePrice: '1178704207617856410',
      source: 'priceUpdate',
      timestamp: '1573660741',
    },
    {
      sharePrice: '1153323445017599212',
      source: 'priceUpdate',
      timestamp: '1573746250',
    },
    {
      sharePrice: '1138990208825841785',
      source: 'priceUpdate',
      timestamp: '1573831765',
    },
    {
      sharePrice: '1124866727060080211',
      source: 'priceUpdate',
      timestamp: '1573918480',
    },
    {
      sharePrice: '1125658071772019832',
      source: 'priceUpdate',
      timestamp: '1573918490',
    },
    {
      sharePrice: '1135096117864844320',
      source: 'priceUpdate',
      timestamp: '1574040416',
    },
    {
      sharePrice: '1139620748247317495',
      source: 'priceUpdate',
      timestamp: '1574043084',
    },
    {
      sharePrice: '1139620745743971050',
      source: 'priceUpdate',
      timestamp: '1574043091',
    },
    {
      sharePrice: '1130153400557371097',
      source: 'priceUpdate',
      timestamp: '1574111941',
    },
    {
      sharePrice: '1130633640128658210',
      source: 'priceUpdate',
      timestamp: '1574113187',
    },
    {
      sharePrice: '1130633603910754499',
      source: 'priceUpdate',
      timestamp: '1574113289',
    },
    {
      sharePrice: '1131115139880709936',
      source: 'priceUpdate',
      timestamp: '1574113409',
    },
    {
      sharePrice: '1130152645952658429',
      source: 'priceUpdate',
      timestamp: '1574114067',
    },
    {
      sharePrice: '1130152640983483415',
      source: 'priceUpdate',
      timestamp: '1574114081',
    },
    {
      sharePrice: '1130152567510681447',
      source: 'priceUpdate',
      timestamp: '1574114288',
    },
    {
      sharePrice: '1130152380456735670',
      source: 'priceUpdate',
      timestamp: '1574114815',
    },
    {
      sharePrice: '1130152347092274714',
      source: 'priceUpdate',
      timestamp: '1574114909',
    },
    {
      sharePrice: '1130152319406870889',
      source: 'priceUpdate',
      timestamp: '1574114987',
    },
    {
      sharePrice: '1130152251613125521',
      source: 'priceUpdate',
      timestamp: '1574115178',
    },
    {
      sharePrice: '1130632732905667784',
      source: 'priceUpdate',
      timestamp: '1574115742',
    },
    {
      sharePrice: '1130632673252648626',
      source: 'priceUpdate',
      timestamp: '1574115910',
    },
    {
      sharePrice: '1149917098417314843',
      source: 'priceUpdate',
      timestamp: '1574176286',
    },
    {
      sharePrice: '1154900781695023451',
      source: 'priceUpdate',
      timestamp: '1574176624',
    },
    {
      sharePrice: '1144000664099172908',
      source: 'priceUpdate',
      timestamp: '1574271711',
    },
    {
      sharePrice: '1144000650461421541',
      source: 'priceUpdate',
      timestamp: '1574271749',
    },
    {
      sharePrice: '1144000619597036864',
      source: 'priceUpdate',
      timestamp: '1574271835',
    },
    {
      sharePrice: '1144000562174926017',
      source: 'priceUpdate',
      timestamp: '1574271995',
    },
    {
      sharePrice: '1144000548537174608',
      source: 'priceUpdate',
      timestamp: '1574272033',
    },
    {
      sharePrice: '1144000543153851614',
      source: 'priceUpdate',
      timestamp: '1574272048',
    },
    {
      sharePrice: '1144000531669429439',
      source: 'priceUpdate',
      timestamp: '1574272080',
    },
    {
      sharePrice: '1173369505238869836',
      source: 'priceUpdate',
      timestamp: '1574358014',
    },
    {
      sharePrice: '1181031036381113002',
      source: 'priceUpdate',
      timestamp: '1574443522',
    },
    {
      sharePrice: '1204662749864491375',
      source: 'priceUpdate',
      timestamp: '1574529399',
    },
    {
      sharePrice: '1204662748736051475',
      source: 'priceUpdate',
      timestamp: '1574529402',
    },
    {
      sharePrice: '1223246155274028443',
      source: 'priceUpdate',
      timestamp: '1574614931',
    },
    {
      sharePrice: '1170261063131534666',
      source: 'priceUpdate',
      timestamp: '1574687748',
    },
    {
      sharePrice: '1188517468680266984',
      source: 'priceUpdate',
      timestamp: '1574773398',
    },
    {
      sharePrice: '1240140309214347914',
      source: 'priceUpdate',
      timestamp: '1574858901',
    },
    {
      sharePrice: '1363724379742147961',
      source: 'priceUpdate',
      timestamp: '1574944400',
    },
    {
      sharePrice: '1417592225992063446',
      source: 'priceUpdate',
      timestamp: '1575031847',
    },
    {
      sharePrice: '1428114725108097221',
      source: 'priceUpdate',
      timestamp: '1575117684',
    },
    {
      sharePrice: '1412572342745836095',
      source: 'priceUpdate',
      timestamp: '1575203207',
    },
    {
      sharePrice: '1410357253112961760',
      source: 'priceUpdate',
      timestamp: '1575224304',
    },
    {
      sharePrice: '1413397233012119830',
      source: 'priceUpdate',
      timestamp: '1575224537',
    },
    {
      sharePrice: '1410356947035560111',
      source: 'priceUpdate',
      timestamp: '1575225008',
    },
    {
      sharePrice: '1410356622697854210',
      source: 'priceUpdate',
      timestamp: '1575225754',
    },
    {
      sharePrice: '1438217872822058241',
      source: 'priceUpdate',
      timestamp: '1575282870',
    },
    {
      sharePrice: '0',
      source: 'priceUpdate',
      timestamp: '1575374273',
    },
    {
      sharePrice: '0',
      source: 'priceUpdate',
      timestamp: '1575459963',
    },
    {
      sharePrice: '0',
      source: 'priceUpdate',
      timestamp: '1575543687',
    },
    {
      sharePrice: '1565926781973233692',
      source: 'priceUpdate',
      timestamp: '1576140672',
    },
    {
      sharePrice: '1836801160868539008',
      source: 'priceUpdate',
      timestamp: '1576237706',
    },
    {
      sharePrice: '1671778105011365649',
      source: 'priceUpdate',
      timestamp: '1576331421',
    },
    {
      sharePrice: '1711732735728268325',
      source: 'priceUpdate',
      timestamp: '1576416925',
    },
    {
      sharePrice: '1832404298479344747',
      source: 'priceUpdate',
      timestamp: '1576502536',
    },
    {
      sharePrice: '2139539223444853814',
      source: 'priceUpdate',
      timestamp: '1576588054',
    },
    {
      sharePrice: '1946887479593324149',
      source: 'priceUpdate',
      timestamp: '1576673740',
    },
    {
      sharePrice: '1787511454262230581',
      source: 'priceUpdate',
      timestamp: '1576759272',
    },
    {
      sharePrice: '1756414186323202031',
      source: 'priceUpdate',
      timestamp: '1576844838',
    },
    {
      sharePrice: '1815047921849761920',
      source: 'priceUpdate',
      timestamp: '1576930500',
    },
    {
      sharePrice: '1661623513797599638',
      source: 'priceUpdate',
      timestamp: '1577016136',
    },
    {
      sharePrice: '1630036101035817722',
      source: 'priceUpdate',
      timestamp: '1577101684',
    },
    {
      sharePrice: '1694606275283570769',
      source: 'priceUpdate',
      timestamp: '1577187202',
    },
    {
      sharePrice: '1709756591970241143',
      source: 'priceUpdate',
      timestamp: '1577273398',
    },
    {
      sharePrice: '1692749059125328829',
      source: 'priceUpdate',
      timestamp: '1577358901',
    },
    {
      sharePrice: '1643752155371131012',
      source: 'priceUpdate',
      timestamp: '1577444528',
    },
    {
      sharePrice: '1611395364006770130',
      source: 'priceUpdate',
      timestamp: '1577530244',
    },
    {
      sharePrice: '1646648124624919162',
      source: 'priceUpdate',
      timestamp: '1577615857',
    },
    {
      sharePrice: '1595659044841336232',
      source: 'priceUpdate',
      timestamp: '1577701366',
    },
    {
      sharePrice: '1673118877051673619',
      source: 'priceUpdate',
      timestamp: '1577786902',
    },
    {
      sharePrice: '1643418020306153484',
      source: 'priceUpdate',
      timestamp: '1577872436',
    },
    {
      sharePrice: '1634690434235628084',
      source: 'priceUpdate',
      timestamp: '1577957967',
    },
    {
      sharePrice: '1733521522383620655',
      source: 'priceUpdate',
      timestamp: '1578043519',
    },
    {
      sharePrice: '1756127665552929238',
      source: 'priceUpdate',
      timestamp: '1578129128',
    },
    {
      sharePrice: '1710979284836675959',
      source: 'priceUpdate',
      timestamp: '1578214636',
    },
    {
      sharePrice: '1844728760268119390',
      source: 'priceUpdate',
      timestamp: '1578300372',
    },
    {
      sharePrice: '1717362084015912979',
      source: 'priceUpdate',
      timestamp: '1578386250',
    },
    {
      sharePrice: '1617210234648329580',
      source: 'priceUpdate',
      timestamp: '1578471859',
    },
    {
      sharePrice: '1642934351009173725',
      source: 'priceUpdate',
      timestamp: '1578557375',
    },
    {
      sharePrice: '1617207298010361686',
      source: 'priceUpdate',
      timestamp: '1578642880',
    },
    {
      sharePrice: '1633469195253487875',
      source: 'priceUpdate',
      timestamp: '1578659307',
    },
    {
      sharePrice: '1617448285335071670',
      source: 'priceUpdate',
      timestamp: '1578744878',
    },
    {
      sharePrice: '1636326331423826570',
      source: 'priceUpdate',
      timestamp: '1578830397',
    },
    {
      sharePrice: '1711766795565279403',
      source: 'priceUpdate',
      timestamp: '1578916307',
    },
    {
      sharePrice: '1675314659610935939',
      source: 'priceUpdate',
      timestamp: '1579001820',
    },
    {
      sharePrice: '1591808961300767473',
      source: 'priceUpdate',
      timestamp: '1579087328',
    },
    {
      sharePrice: '1787467784961108535',
      source: 'priceUpdate',
      timestamp: '1579172849',
    },
    {
      sharePrice: '1806975670212946451',
      source: 'priceUpdate',
      timestamp: '1579258372',
    },
    {
      sharePrice: '1844704912864184884',
      source: 'priceUpdate',
      timestamp: '1579343959',
    },
    {
      sharePrice: '1820405963975034580',
      source: 'priceUpdate',
      timestamp: '1579429474',
    },
    {
      sharePrice: '1865336025144681598',
      source: 'priceUpdate',
      timestamp: '1579516021',
    },
    {
      sharePrice: '1865335972778562333',
      source: 'priceUpdate',
      timestamp: '1579516114',
    },
    {
      sharePrice: '1808586630556729090',
      source: 'priceUpdate',
      timestamp: '1579601631',
    },
    {
      sharePrice: '1790494299166427657',
      source: 'priceUpdate',
      timestamp: '1579687329',
    },
    {
      sharePrice: '1749429070496002960',
      source: 'priceUpdate',
      timestamp: '1579772912',
    },
    {
      sharePrice: '1807846238289693390',
      source: 'priceUpdate',
      timestamp: '1579858645',
    },
    {
      sharePrice: '1912685851334537912',
      source: 'priceUpdate',
      timestamp: '1579944185',
    },
    {
      sharePrice: '1925266450130526363',
      source: 'priceUpdate',
      timestamp: '1580029915',
    },
    {
      sharePrice: '1970632552208721020',
      source: 'priceUpdate',
      timestamp: '1580115433',
    },
    {
      sharePrice: '1972059707441481046',
      source: 'priceUpdate',
      timestamp: '1580129455',
    },
    {
      sharePrice: '1928542540945836865',
      source: 'priceUpdate',
      timestamp: '1580214967',
    },
    {
      sharePrice: '1834646463384609969',
      source: 'priceUpdate',
      timestamp: '1580300501',
    },
    {
      sharePrice: '1834646445641447156',
      source: 'priceUpdate',
      timestamp: '1580300533',
    },
    {
      sharePrice: '1814164135067928890',
      source: 'priceUpdate',
      timestamp: '1580386590',
    },
    {
      sharePrice: '1864225530378043520',
      source: 'priceUpdate',
      timestamp: '1580472125',
    },
    {
      sharePrice: '1867558184014810937',
      source: 'priceUpdate',
      timestamp: '1580558843',
    },
    {
      sharePrice: '1825764783980338133',
      source: 'priceUpdate',
      timestamp: '1580644393',
    },
    {
      sharePrice: '1828005743734038012',
      source: 'priceUpdate',
      timestamp: '1580729952',
    },
    {
      sharePrice: '2035125292757516009',
      source: 'priceUpdate',
      timestamp: '1580839448',
    },
    {
      sharePrice: '2042579249180520580',
      source: 'priceUpdate',
      timestamp: '1580841383',
    },
    {
      sharePrice: '2042578937355096163',
      source: 'priceUpdate',
      timestamp: '1580841891',
    },
    {
      sharePrice: '1801480804860238293',
      source: 'priceUpdate',
      timestamp: '1581003895',
    },
    {
      sharePrice: '1801480797228165962',
      source: 'priceUpdate',
      timestamp: '1581003909',
    },
    {
      sharePrice: '1808237672833077531',
      source: 'priceUpdate',
      timestamp: '1581089803',
    },
    {
      sharePrice: '1819665950875850272',
      source: 'priceUpdate',
      timestamp: '1581134976',
    },
    {
      sharePrice: '1818834696563953409',
      source: 'priceUpdate',
      timestamp: '1581135007',
    },
    {
      sharePrice: '1815282369134958313',
      source: 'priceUpdate',
      timestamp: '1581139841',
    },
    {
      sharePrice: '1815282307086268108',
      source: 'priceUpdate',
      timestamp: '1581139954',
    },
    {
      sharePrice: '1776931743768064941',
      source: 'priceUpdate',
      timestamp: '1581225521',
    },
    {
      sharePrice: '1808787612209809556',
      source: 'priceUpdate',
      timestamp: '1581311132',
    },
    {
      sharePrice: '1825316499134479432',
      source: 'priceUpdate',
      timestamp: '1581396684',
    },
    {
      sharePrice: '1776648526600954410',
      source: 'priceUpdate',
      timestamp: '1581482251',
    },
    {
      sharePrice: '1776648517452317867',
      source: 'priceUpdate',
      timestamp: '1581482268',
    },
    {
      sharePrice: '1740815041887304801',
      source: 'priceUpdate',
      timestamp: '1581567859',
    },
    {
      sharePrice: '1903346415025742506',
      source: 'priceUpdate',
      timestamp: '1581653357',
    },
    {
      sharePrice: '1906085281592894554',
      source: 'priceUpdate',
      timestamp: '1581738872',
    },
    {
      sharePrice: '1879419803950103175',
      source: 'priceUpdate',
      timestamp: '1581824385',
    },
    {
      sharePrice: '1861490559070952785',
      source: 'priceUpdate',
      timestamp: '1581897328',
    },
    {
      sharePrice: '1841131338188664285',
      source: 'priceUpdate',
      timestamp: '1581982860',
    },
    {
      sharePrice: '1933952266453468447',
      source: 'priceUpdate',
      timestamp: '1582070168',
    },
    {
      sharePrice: '2146190602377553932',
      source: 'priceUpdate',
      timestamp: '1582157578',
    },
    {
      sharePrice: '2266357895556340797',
      source: 'priceUpdate',
      timestamp: '1582244889',
    },
    {
      sharePrice: '2313822093260838137',
      source: 'priceUpdate',
      timestamp: '1582281970',
    },
    {
      sharePrice: '2547131805367045688',
      source: 'priceUpdate',
      timestamp: '1582372882',
    },
    {
      sharePrice: '2320497928647630108',
      source: 'priceUpdate',
      timestamp: '1582460198',
    },
    {
      sharePrice: '2544893832185901667',
      source: 'priceUpdate',
      timestamp: '1582547600',
    },
    {
      sharePrice: '2513491444579283797',
      source: 'priceUpdate',
      timestamp: '1582591183',
    },
    {
      sharePrice: '2387382629935172380',
      source: 'priceUpdate',
      timestamp: '1582620126',
    },
    {
      sharePrice: '2387382605707466739',
      source: 'priceUpdate',
      timestamp: '1582620160',
    },
    {
      sharePrice: '2389797696004435763',
      source: 'priceUpdate',
      timestamp: '1582620311',
    },
    {
      sharePrice: '2473434111537919261',
      source: 'priceUpdate',
      timestamp: '1582706461',
    },
    {
      sharePrice: '2521695959151188644',
      source: 'priceUpdate',
      timestamp: '1582791986',
    },
    {
      sharePrice: '2773984668113769306',
      source: 'priceUpdate',
      timestamp: '1582879322',
    },
    {
      sharePrice: '2799574712356344069',
      source: 'priceUpdate',
      timestamp: '1582966666',
    },
    {
      sharePrice: '4109345504782466552',
      source: 'priceUpdate',
      timestamp: '1583054001',
    },
    {
      sharePrice: '3568655903651837816',
      source: 'priceUpdate',
      timestamp: '1583141313',
    },
    {
      sharePrice: '3430833024680363558',
      source: 'priceUpdate',
      timestamp: '1583226834',
    },
    {
      sharePrice: '3220524587994600441',
      source: 'priceUpdate',
      timestamp: '1583312357',
    },
    {
      sharePrice: '3470168151274987537',
      source: 'priceUpdate',
      timestamp: '1583397898',
    },
    {
      sharePrice: '3486895832510948509',
      source: 'priceUpdate',
      timestamp: '1583483478',
    },
    {
      sharePrice: '3559846348080433016',
      source: 'priceUpdate',
      timestamp: '1583519098',
    },
    {
      sharePrice: '3559846331315266331',
      source: 'priceUpdate',
      timestamp: '1583519114',
    },
    {
      sharePrice: '3553785217247301256',
      source: 'priceUpdate',
      timestamp: '1583520841',
    },
    {
      sharePrice: '3559691767174143077',
      source: 'priceUpdate',
      timestamp: '1583521838',
    },
    {
      sharePrice: '3833248701590200106',
      source: 'priceUpdate',
      timestamp: '1583585773',
    },
    {
      sharePrice: '3943573143270946676',
      source: 'priceUpdate',
      timestamp: '1583676639',
    },
    {
      sharePrice: '3812585652170050605',
      source: 'priceUpdate',
      timestamp: '1583741185',
    },
    {
      sharePrice: '4048257639583096549',
      source: 'priceUpdate',
      timestamp: '1583828520',
    },
    {
      sharePrice: '4527213598921882795',
      source: 'priceUpdate',
      timestamp: '1583914099',
    },
    {
      sharePrice: '4579072770444731320',
      source: 'priceUpdate',
      timestamp: '1584038611',
    },
    {
      sharePrice: '4345435019979813812',
      source: 'priceUpdate',
      timestamp: '1584099309',
    },
    {
      sharePrice: '4457602057409230025',
      source: 'priceUpdate',
      timestamp: '1584172807',
    },
    {
      sharePrice: '4372498271387708204',
      source: 'priceUpdate',
      timestamp: '1584259206',
    },
    {
      sharePrice: '3948499846650944767',
      source: 'priceUpdate',
      timestamp: '1584345795',
    },
    {
      sharePrice: '4114263428773880113',
      source: 'priceUpdate',
      timestamp: '1584375749',
    },
    {
      sharePrice: '4000370457027424122',
      source: 'priceUpdate',
      timestamp: '1584382373',
    },
    {
      sharePrice: '4251215262574541883',
      source: 'priceUpdate',
      timestamp: '1584432187',
    },
    {
      sharePrice: '4231105875719840820',
      source: 'priceUpdate',
      timestamp: '1584518449',
    },
    {
      sharePrice: '4367099378140761776',
      source: 'priceUpdate',
      timestamp: '1584604810',
    },
    {
      sharePrice: '4090120394737914371',
      source: 'priceUpdate',
      timestamp: '1584700996',
    },
    {
      sharePrice: '4043214715438590626',
      source: 'priceUpdate',
      timestamp: '1584763951',
    },
    {
      sharePrice: '4000071612941858612',
      source: 'priceUpdate',
      timestamp: '1584850240',
    },
    {
      sharePrice: '3906083962776450009',
      source: 'priceUpdate',
      timestamp: '1584936633',
    },
    {
      sharePrice: '3830894291147477252',
      source: 'priceUpdate',
      timestamp: '1585050294',
    },
    {
      sharePrice: '3829215019613536840',
      source: 'priceUpdate',
      timestamp: '1585123207',
    },
    {
      sharePrice: '3690739413762778073',
      source: 'priceUpdate',
      timestamp: '1585209692',
    },
    {
      sharePrice: '3748258481505684009',
      source: 'priceUpdate',
      timestamp: '1585296023',
    },
    {
      sharePrice: '3768978918961338678',
      source: 'priceUpdate',
      timestamp: '1585382404',
    },
    {
      sharePrice: '3754524844490119880',
      source: 'priceUpdate',
      timestamp: '1585468828',
    },
    {
      sharePrice: '3712603132851588415',
      source: 'priceUpdate',
      timestamp: '1585555302',
    },
    {
      sharePrice: '3712176510956518694',
      source: 'priceUpdate',
      timestamp: '1585641733',
    },
    {
      sharePrice: '3641455718105876882',
      source: 'priceUpdate',
      timestamp: '1585728145',
    },
    {
      sharePrice: '3490174591690185946',
      source: 'priceUpdate',
      timestamp: '1585814563',
    },
    {
      sharePrice: '3486146036520460951',
      source: 'priceUpdate',
      timestamp: '1585900920',
    },
  ],
  createdAt: '1563462093',
  name: 'AVANTGARDE',
};

const eek = {
  calculationsHistory: [
    {
      sharePrice: '992338834481682599',
      source: 'priceUpdate',
      timestamp: '1584259206',
    },
    {
      sharePrice: '1028641738176597458',
      source: 'priceUpdate',
      timestamp: '1584345795',
    },
    {
      sharePrice: '1020011008132814314',
      source: 'priceUpdate',
      timestamp: '1584375749',
    },
    {
      sharePrice: '1018139985742305971',
      source: 'priceUpdate',
      timestamp: '1584382373',
    },
    {
      sharePrice: '999731181195745440',
      source: 'priceUpdate',
      timestamp: '1584432187',
    },
    {
      sharePrice: '1005480092389871729',
      source: 'priceUpdate',
      timestamp: '1584518449',
    },
    {
      sharePrice: '996251866765403066',
      source: 'priceUpdate',
      timestamp: '1584604810',
    },
    {
      sharePrice: '978855572925116700',
      source: 'priceUpdate',
      timestamp: '1584700996',
    },
    {
      sharePrice: '988610794757926082',
      source: 'priceUpdate',
      timestamp: '1584763951',
    },
    {
      sharePrice: '987697190732566592',
      source: 'priceUpdate',
      timestamp: '1584850240',
    },
    {
      sharePrice: '997878633178036280',
      source: 'priceUpdate',
      timestamp: '1584936633',
    },
    {
      sharePrice: '990919417806701243',
      source: 'priceUpdate',
      timestamp: '1585050294',
    },
    {
      sharePrice: '994002342218189959',
      source: 'priceUpdate',
      timestamp: '1585123207',
    },
    {
      sharePrice: '998027641114690500',
      source: 'priceUpdate',
      timestamp: '1585209692',
    },
    {
      sharePrice: '998101940071846823',
      source: 'priceUpdate',
      timestamp: '1585296023',
    },
    {
      sharePrice: '999304148874755009',
      source: 'priceUpdate',
      timestamp: '1585382404',
    },
    {
      sharePrice: '991343083249961603',
      source: 'priceUpdate',
      timestamp: '1585468828',
    },
    {
      sharePrice: '994347040526408655',
      source: 'priceUpdate',
      timestamp: '1585555302',
    },
    {
      sharePrice: '995785798787081229',
      source: 'priceUpdate',
      timestamp: '1585641733',
    },
    {
      sharePrice: '989334504879123933',
      source: 'priceUpdate',
      timestamp: '1585728145',
    },
    {
      sharePrice: '984638375698121277',
      source: 'priceUpdate',
      timestamp: '1585814563',
    },
    {
      sharePrice: '961628281898801426',
      source: 'priceUpdate',
      timestamp: '1585900920',
    },
  ],
  createdAt: '1584202322',
  name: 'EEK Capital',
};

const subgraphData = [eek, ag, helloFund];

export const Default: React.FC = () => <Nivo generator={singleFundQuery} />;
