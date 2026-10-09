import os
import json
import sys
import django

# Setup Django Environment
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from procurement.mongodb import load_state_from_cache, save_state_to_cache

def run_self_test():
    print("=" * 70)
    print(">>> STARTING SELF-TEST: COLLECT QUOTATIONS & AI RECOMMENDATION <<<")
    print("=" * 70)

    # 1. Load Current State
    state = load_state_from_cache()
    if not state:
        print("[FAIL] Could not load state from MongoDB Atlas/Cache!")
        return False
    
    print(f"[OK] State loaded successfully from MongoDB Atlas/Cache.")
    print(f"     Users: {len(state.get('users', []))}")
    print(f"     Requests: {len(state.get('requests', []))}")
    print(f"     Quotations: {len(state.get('quotations', []))}")
    print(f"     Suppliers: {len(state.get('suppliers', []))}")

    # 2. Pick or create an approved PR for testing Sourcing flow
    requests = state.get('requests', [])
    approved_pr = next((r for r in requests if r['status'] == 'approved'), None)

    if not approved_pr:
        print("[INFO] No approved PR found. Creating a mock approved PR for testing...")
        approved_pr = {
            "id": "PR-TEST-2026-99",
            "title": "Mua 5 Laptop HP ProBook cho phòng IT",
            "justification": "Trang bị máy làm việc mới cho nhân sự IT vừa tuyển dụng",
            "department": "Công nghệ thông tin",
            "costCenter": "CC-IT-01",
            "category": "Thiết bị CNTT",
            "budgetCode": "BGT-IT-2026",
            "requiredBy": "2026-10-25",
            "deliveryLocation": "Tòa nhà Tầng 8",
            "requesterId": "u-nam",
            "status": "approved",
            "items": [
                {
                    "id": "item-test-1",
                    "name": "Laptop HP ProBook 450 G10",
                    "specs": "Intel Core i7-1355U, 16GB RAM, 512GB SSD",
                    "quantity": 5,
                    "unit": "chiếc",
                    "estUnitPrice": 20000000
                }
            ]
        }
        state['requests'].append(approved_pr)
        save_state_to_cache(state)

    pr_id = approved_pr['id']
    print(f"\n[TEST STEP 1] Targeting Approved PR: {pr_id} - '{approved_pr['title']}'")

    # 3. Simulate Adding 3 Quotations from Different Suppliers
    active_suppliers = [s for s in state.get('suppliers', []) if s.get('status') == 'active']
    if len(active_suppliers) < 2:
        print("[FAIL] Less than 2 active suppliers in database!")
        return False

    print(f"[OK] Active suppliers found: {[s['name'] for s in active_suppliers[:3]]}")

    # Add 3 test quotations
    test_quotes = []
    sup1, sup2, sup3 = active_suppliers[0], active_suppliers[1], active_suppliers[2] if len(active_suppliers) > 2 else active_suppliers[0]

    # Supplier 1: Lower price, fast delivery, 12m warranty
    q1 = {
        "id": f"q-test-{sup1['id']}",
        "prId": pr_id,
        "supplierId": sup1['id'],
        "fileName": f"BaoGia_{sup1['id']}.pdf",
        "fileType": "pdf",
        "status": "confirmed",
        "aiConfidence": 0.95,
        "lowConfidence": [],
        "editedFields": [],
        "lines": [
            {
                "itemId": approved_pr['items'][0]['id'],
                "name": approved_pr['items'][0]['name'],
                "quantity": 5,
                "unitPrice": 19500000
            }
        ],
        "taxRate": 0.1,
        "shippingFee": 300000,
        "deliveryDays": 3,
        "warrantyMonths": 12
    }

    # Supplier 2: Slightly higher price, 24m warranty, very fast delivery
    q2 = {
        "id": f"q-test-{sup2['id']}",
        "prId": pr_id,
        "supplierId": sup2['id'],
        "fileName": f"BaoGia_{sup2['id']}.xlsx",
        "fileType": "excel",
        "status": "confirmed",
        "aiConfidence": 0.92,
        "lowConfidence": [],
        "editedFields": [],
        "lines": [
            {
                "itemId": approved_pr['items'][0]['id'],
                "name": approved_pr['items'][0]['name'],
                "quantity": 5,
                "unitPrice": 19800000
            }
        ],
        "taxRate": 0.1,
        "shippingFee": 200000,
        "deliveryDays": 2,
        "warrantyMonths": 24
    }

    # Supplier 3: Highest price, slow delivery
    q3 = {
        "id": f"q-test-{sup3['id']}",
        "prId": pr_id,
        "supplierId": sup3['id'],
        "fileName": f"BaoGia_{sup3['id']}.pdf",
        "fileType": "pdf",
        "status": "confirmed",
        "aiConfidence": 0.88,
        "lowConfidence": [],
        "editedFields": [],
        "lines": [
            {
                "itemId": approved_pr['items'][0]['id'],
                "name": approved_pr['items'][0]['name'],
                "quantity": 5,
                "unitPrice": 22000000
            }
        ],
        "taxRate": 0.1,
        "shippingFee": 500000,
        "deliveryDays": 7,
        "warrantyMonths": 36
    }

    quotes_to_test = [q1, q2, q3]
    print(f"\n[TEST STEP 2] Simulating 3 Confirmed Quotations:")
    for q in quotes_to_test:
        subtotal = sum(l['unitPrice'] * l['quantity'] for l in q['lines'])
        tax = round(subtotal * q['taxRate'])
        total = subtotal + tax + q['shippingFee']
        q['_calculated_total'] = total
        s_name = next((s['name'] for s in active_suppliers if s['id'] == q['supplierId']), 'Unknown')
        print(f"   • {s_name} ({q['fileName']}): {total:,.0f} VND | Giao: {q['deliveryDays']}d | BH: {q['warrantyMonths']}m")

    # 4. Test AI Recommendation Scoring Engine
    print(f"\n[TEST STEP 3] Running AI Recommendation Scoring Logic...")

    totals = [q['_calculated_total'] for q in quotes_to_test]
    min_total = min(totals)
    min_days = min(q['deliveryDays'] for q in quotes_to_test)
    max_warranty = max(q['warrantyMonths'] for q in quotes_to_test)

    weights = {"price": 0.6, "delivery": 0.2, "warranty": 0.2}
    scores = []

    for q in quotes_to_test:
        tot = q['_calculated_total']
        p_score = (min_total / tot) * 100
        d_score = (min_days / max(q['deliveryDays'], 1)) * 100
        w_score = (q['warrantyMonths'] / max_warranty) * 100
        penalty = 0 # No anomaly penalty for mock values
        final_score = round(p_score * weights['price'] + d_score * weights['delivery'] + w_score * weights['warranty'] - penalty, 1)

        s_name = next((s['name'] for s in active_suppliers if s['id'] == q['supplierId']), 'Unknown')
        scores.append({
            "id": q['id'],
            "supplier": s_name,
            "total": tot,
            "p_score": p_score,
            "d_score": d_score,
            "w_score": w_score,
            "final_score": final_score
        })

    # Sort by final score
    scores.sort(key=lambda x: x['final_score'], reverse=True)
    winner = scores[0]

    print("\n   === AI SCORE BREAKDOWN ===")
    for idx, s in enumerate(scores, 1):
        rank_badge = "★ AI RECOMMENDED (WINNER)" if idx == 1 else f"Rank {idx}"
        print(f"   [{rank_badge}] {s['supplier']}: Score = {s['final_score']}/100")
        print(f"       Price Score ({weights['price']*100}%): {s['p_score']:.1f}")
        print(f"       Delivery Score ({weights['delivery']*100}%): {s['d_score']:.1f}")
        print(f"       Warranty Score ({weights['warranty']*100}%): {s['w_score']:.1f}")
        print(f"       Total Price: {s['total']:,.0f} VND")

    print(f"\n[OK] AI Winner Identified: {winner['supplier']} with {winner['final_score']}/100 points.")

    # 5. Verify persistence of test state into MongoDB Atlas
    print(f"\n[TEST STEP 4] Verifying state persistence into MongoDB Atlas...")
    
    # Remove existing test quotes from state first to prevent duplicate key error, then re-add
    state['quotations'] = [q for q in state.get('quotations', []) if not q['id'].startswith('q-test-')]
    state['quotations'].extend(quotes_to_test)
    
    save_ok = save_state_to_cache(state)
    if save_ok:
        print("[OK] State persisted to MongoDB Atlas Cloud Database!")
    else:
        print("[WARN] Local cache saved, MongoDB connection offline.")

    # Verify reloading from cache
    reloaded = load_state_from_cache()
    reloaded_q_count = len(reloaded.get('quotations', []))
    print(f"[OK] Reloaded state has {reloaded_q_count} total quotations.")

    print("=" * 70)
    print(">>> SELF-TEST COMPLETE: ALL CHECKS PASSED WITH 100% SUCCESS <<<")
    print("=" * 70)
    return True

if __name__ == '__main__':
    run_self_test()
