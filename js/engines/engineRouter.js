export function calculateMyntraSP(category, TP){

  // TODO: Add Myntra fee structure

  let SP = TP * 1.3; // temporary logic

  return {
    SP,
    Commission: 0,
    Collection: 0,
    Fixed: 0,
    CommissionGST: 0,
    CollectionGST: 0,
    FixedGST: 0,
    TDS: 0,
    TCS: 0,
    BankSettlement: TP,
    InputGSTCredit: 0,
    IncomeTaxCredit: 0,
    EffectiveNet: TP
  };
}
