from pipeline.graph_builder import build_doc_graph
from pipeline.contradiction import detect_contradictions
from pipeline.chain_detector import detect_missing_chains

docs = [
    {'id': 'doc_1', 'doc_type': 'PURCHASE_ORDER', 'filename': 'PO_4521.pdf', 'full_text': 'PO 4521 Vendor: Nexus Corp Amount: Rs 415000', 'structured_fields': {'po_number': '4521', 'vendor_name': 'Nexus Corp', 'amount_total': 415000}},
    {'id': 'doc_2', 'doc_type': 'INVOICE', 'filename': 'Invoice_089.pdf', 'full_text': 'Invoice for PO 4521 Amount: Rs 485000', 'structured_fields': {'po_reference': '4521', 'amount_total': 485000}},
    {'id': 'doc_3', 'doc_type': 'PAYMENT_CONFIRMATION', 'filename': 'Payment_Conf.pdf', 'full_text': 'Payment for PO 4521', 'structured_fields': {'po_reference': '4521', 'amount_paid': 1240000}},
]

print('Step 4: Building graph...')
graph = build_doc_graph(docs)
print('  PO Groups:', graph['po_groups'])
print('  Vendor Groups:', graph['vendor_groups'])

print('Step 5: Detecting contradictions...')
contras = detect_contradictions(docs, graph)
print(f'  Found {len(contras)} contradictions')

print('Step 6: Detecting missing chains...')
chains = detect_missing_chains(graph, docs)
print(f'  Found {len(chains)} missing chains')

print('All steps OK!')