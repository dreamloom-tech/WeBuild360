"use client";

import { useEffect, useState } from 'react';

export default function Page() {
	const [reports, setReports] = useState<any[]>([]);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await fetch('/api/reports/projects');
				const json = await res.json();
				if (mounted) setReports(json || []);
			} catch (err) {
				// ignore
			}
		})();
		return () => { mounted = false; };
	}, []);

	return (
		<main style={{ padding: 20 }}>
			<h1>Project Reports</h1>
			{reports.length === 0 ? (
				<p>No project reports available.</p>
			) : (
				reports.map((r, i) => (
					<section key={i} style={{ marginBottom: 20 }}>
						<h3>{r.project} — Budget: ₹{r.budget}</h3>
						<div style={{ display: 'flex', gap: 24 }}>
							<div>
								<h4>Expenses by category</h4>
								<ul>
									{r.expensesByCategory.map((c: any, idx: number) => (
										<li key={idx}>{c.category}: ₹{c.amount}</li>
									))}
								</ul>
							</div>
							<div>
								<h4>Materials</h4>
								<ul>
									{r.materialSummary.map((m: any, idx: number) => (
										<li key={idx}>{m.material}: {m.qty} units — ₹{m.cost}</li>
									))}
								</ul>
							</div>
						</div>
					</section>
				))
			)}
		</main>
	);
}
