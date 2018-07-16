set campaign;
param e0 {campaign};
param e1 {campaign};
param z {campaign};
param min_cost {campaign};
param max_cost {campaign};
param min_total;
param max_total;
var cost {campaign};
maximize total_profit:
		sum {j in campaign} ((e0[j]*cost[j]^e1[j])*z[j])
		- sum {j in campaign} cost[j];
	
subject to bound_cost {j in campaign}: min_cost[j] <= cost[j] <= max_cost[j];
subject to bound_total : min_total <= sum {j in campaign} cost[j] <= max_total;
