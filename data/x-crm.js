/* helpers for the CRM / Products rework (live NuHome design): city → state lookup */
(function () {
  const M = { Pune: 'Maharashtra', Nashik: 'Maharashtra', Mumbai: 'Maharashtra', 'Navi Mumbai': 'Maharashtra', Thane: 'Maharashtra', Kalyan: 'Maharashtra', Andheri: 'Maharashtra', Nagpur: 'Maharashtra', Indore: 'Madhya Pradesh', Bhopal: 'Madhya Pradesh', Bengaluru: 'Karnataka', Ahmedabad: 'Gujarat', Surat: 'Gujarat', Vadodara: 'Gujarat', Valsad: 'Gujarat', Bilimora: 'Gujarat', Hyderabad: 'Telangana', Delhi: 'Delhi', 'New Delhi': 'Delhi', Gurugram: 'Haryana', Chennai: 'Tamil Nadu', Jaipur: 'Rajasthan', Lucknow: 'Uttar Pradesh', Kanpur: 'Uttar Pradesh', Bahraich: 'Uttar Pradesh', Kochi: 'Kerala', Thrissur: 'Kerala', Calicut: 'Kerala', Kolkata: 'West Bengal', Chandigarh: 'Chandigarh', Srinagar: 'Jammu & Kashmir', Jammu: 'Jammu & Kashmir' };
  DM.stateOf = (p) => M[p.city] || p.state || p.region || '—';
})();
