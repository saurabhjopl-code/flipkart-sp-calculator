export function calculateFlipkart(row, data) {

  const category = row.cat;
  const TP = row.simTP;

  const commissionTable = data.fkCommission[category] || [];
  const fixedTable = data.fkFixed[category] || [];
  const collectionTable = data.fkCollection[category] || [];
  const gtaTable = data.fkGTA[category] || [];

  function findSlab(table, price) {
    return table.find(s => price >= s.min && price <= s.max);
  }

  function getGTA(price) {
    const slab = findSlab(gtaTable, price);
    return slab ? slab.fee : 0;
  }

  let SP = TP;
  let GTA = 0;
  let Commission = 0;
  let Fixed = 0;
  let Collection = 0;

  for (let i = 0; i < 20; i++) {

    GTA = getGTA(SP);
    const sellerPrice = SP - GTA;

    const commSlab = findSlab(commissionTable, sellerPrice);
    const fixedSlab = findSlab(fixedTable, sellerPrice);
    const collSlab = findSlab(collectionTable, sellerPrice);

    Commission = commSlab ? sellerPrice * (commSlab.rate / 100) : 0;
    Fixed = fixedSlab ? fixedSlab.fee : 0;
    Collection = collSlab ? sellerPrice * (collSlab.rate / 100) : 0;

    const GST = 0.18 * (Commission + Fixed + Collection);
    const TDS = sellerPrice * 0.01;
    const TCS = sellerPrice * 0.01;

    const Net =
      sellerPrice -
      Commission -
      Fixed -
      Collection -
      GST -
      TDS -
      TCS +
      GST +
      TCS +
      TDS;

    SP += (TP - Net);
  }

  const sellerPrice = SP - GTA;
  const GST = 0.18 * (Commission + Fixed + Collection);
  const TDS = sellerPrice * 0.01;
  const TCS = sellerPrice * 0.01;

  return {
    SP,
    GTA,
    Commission,
    Collection,
    Fixed,
    TDS,
    TCS,
    BankSettlement: sellerPrice - Commission - Fixed - Collection - GST - TDS - TCS,
    InputGSTCredit: GST + TCS,
    IncomeTaxCredit: TDS,
    EffectiveNet: TP
  };
}
