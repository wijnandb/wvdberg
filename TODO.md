# TODO — WvdBerg

## Domain Transfer to Porkbun (PRIORITY: close the loop)

**Goal:** Move both domains from TransIP to Porkbun for DNS automation + cost savings.

### Steps

- [ ] Create Porkbun account (if not done yet)
- [ ] Log into TransIP
- [ ] Request domain transfer auth codes for both domains
- [ ] WvdBerg receives confirmation email — needs to approve/forward code
- [ ] Initiate transfer at Porkbun using auth codes
- [ ] After transfer completes: set up DNS records via Porkbun API
- [ ] **Keep MX records untouched** — do NOT change email routing
- [ ] Verify both domains resolve correctly after DNS propagation
- [ ] Verify email still works (MX intact)

### Domains

1. _[fill in domain 1]_
2. _[fill in domain 2]_

### Notes

- TransIP → Porkbun saves money and enables automated DNS via Porkbun API skill
- MX records are sacred — touch nothing email-related
- This is a "last 10%" task. Website is built. This finishes the delivery.

---

*Created: 2026-03-10 | Context: coaching session — closing loops*
