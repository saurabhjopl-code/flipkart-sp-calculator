export function calculateMyntra(row, data) {

  const article = row.cat;
  const brand = row.brand;
  const TP = row.simTP;

  const commissionTable =
    (data.commissionData[brand] &&
      data.commissionData[brand][article]) || [];

  const fixedTable =
    (data.fixedData[brand] &&
      data.fixedData[brand][article]) || [];

  const level = data.levelMap[article];
  const gtaTable = level ? data.gtaData[level] || [] : [];

  function findSlab(table, price) {
    return table.find(s => price >= s.min && price <= s.max);
  }

  let SP = TP;
  let GTA = 0;
  let Commission = 0;
  let Fixed = 0;

  for (let i = 0; i < 20; i++) {

    const gtaSlab = findSlab(gtaTable, SP);
    GTA = gtaSlab ? gtaSlab.fee : 0;

    const sellerPrice = SP - GTA;

    const commSlab = findSlab(commissionTable, sellerPrice);
    const fixedSlab = findSlab(fixedTable, sellerPrice);

    Commission = commSlab ? sellerPrice * (commSlab.rate / 100) : 0;
    Fixed = fixedSlab ? fixedSlab.fee : 0;

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
