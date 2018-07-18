option presolve 0;
set campaign;
param e0 {campaign};
param e1 {campaign};
param e2 {campaign};
param z {campaign};
param min_cost {campaign};
param max_cost {campaign};
param min_total;
param max_total;
var cost {campaign};
minimize total_profit: (sum {j in campaign} cost[j]) / (sum {j in campaign} (e0[j]+e1[j]*cost[j]+e2[j]*cost[j]^2)*z[j]);
	
subject to bound_cost {j in campaign}: min_cost[j] <= cost[j] <= max_cost[j];
subject to bound_total : min_total <= sum {j in campaign} cost[j] <= max_total;
subject to bound_cpa {j in campaign}: (e0[j]*log(cost[j])+e1[j])*z[j] >= 0.001;