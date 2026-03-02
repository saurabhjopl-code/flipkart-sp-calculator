export function calculateFlipkart(category, TP, tables) {

  const commissionTable = tables.fkCommission || [];
  const fixedTable = tables.fkFixed || [];
  const collectionTable = tables.fkCollection || [];
  const gtaTable = tables.fkGTA || [];

  function findSlab(table, category, price) {
    return table.find(r =>
      r.category === category &&
      price >= Number(r["lower limit"]) &&
      price <= Number(r["upper limit"])
    );
  }

  function getGTA(category, price) {
    const slab = gtaTable.find(r =>
      r.Category === category &&
      price >= Number(r["lower limit"]) &&
      price <= Number(r["upper limit"])
    );
    return slab ? Number(slab.fees) : 0;
  }

  let SP = TP;
  let GTA = 0;
  let Commission = 0;
  let Fixed = 0;
  let Collection = 0;

  for (let i = 0; i < 20; i++) {

    GTA = getGTA(category, SP);
    const sellerPrice = SP - GTA;

    const commSlab = findSlab(commissionTable, category, sellerPrice);
    const fixedSlab = findSlab(fixedTable, category, sellerPrice);
    const collSlab = findSlab(collectionTable, category, sellerPrice);

    Commission = commSlab ? sellerPrice * (parseFloat(commSlab.fee) / 100) : 0;
    Fixed = fixedSlab ? Number(fixedSlab.fee) : 0;
    Collection = collSlab ? sellerPrice * (parseFloat(collSlab.fee) / 100) : 0;

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
