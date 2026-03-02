export function calculateMyntra(articleType, TP, brand, tables) {

  const commissionTable = tables.myntraCommission || [];
  const fixedTable = tables.myntraFixed || [];
  const levelMap = tables.myntraLevelMap || [];
  const gtaTable = tables.myntraGTA || [];

  function getLevel(articleType) {
    const row = levelMap.find(r => r["Article Type"] === articleType);
    return row ? row.Levels : null;
  }

  function getGTA(level, price) {
    const slab = gtaTable.find(r =>
      r.Levels === level &&
      price >= Number(r["Lower Limit"]) &&
      price <= Number(r["Upper Limit"])
    );
    return slab ? Number(slab.Charges) : 0;
  }

  function findSlab(table, brand, articleType, price) {
    return table.find(r =>
      r.Brand === brand &&
      r["Article Type"] === articleType &&
      price >= Number(r["Lower Limit"]) &&
      price <= Number(r["Upper Limit"])
    );
  }

  let SP = TP;
  let GTA = 0;
  let Commission = 0;
  let Fixed = 0;

  const level = getLevel(articleType);

  for (let i = 0; i < 20; i++) {

    GTA = getGTA(level, SP);
    const sellerPrice = SP - GTA;

    const commSlab = findSlab(commissionTable, brand, articleType, sellerPrice);
    const fixedSlab = findSlab(fixedTable, brand, articleType, sellerPrice);

    Commission = commSlab ? sellerPrice * (parseFloat(commSlab.Commission) / 100) : 0;
    Fixed = fixedSlab ? Number(fixedSlab.FEE) : 0;

    const GST = 0.18 * (Commission + Fixed);
    const TDS = sellerPrice * 0.01;
    const TCS = sellerPrice * 0.01;

    const Net =
      sellerPrice -
      Commission -
      Fixed -
      GST -
      TDS -
      TCS +
      GST +
      TCS +
      TDS;

    SP += (TP - Net);
  }

  const sellerPrice = SP - GTA;
  const GST = 0.18 * (Commission + Fixed);
  const TDS = sellerPrice * 0.01;
  const TCS = sellerPrice * 0.01;

  return {
    SP,
    GTA,
    Commission,
    Collection: 0,
    Fixed,
    TDS,
    TCS,
    BankSettlement: sellerPrice - Commission - Fixed - GST - TDS - TCS,
    InputGSTCredit: GST + TCS,
    IncomeTaxCredit: TDS,
    EffectiveNet: TP
  };
}
