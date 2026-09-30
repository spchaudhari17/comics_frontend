# Google Analytics (GA4) events

Helper: `src/utility/analytics.js`. All events also carry `page_path`.
Events marked with USER also send `app_user_id`, `user_role`, `is_logged_in` (no email / name / phone).

## Navigation
| Event | Where | Params |
|---|---|---|
| header_marketplace_click | Header | location |
| header_subscription_plan_click | Header "Pricing" | location |
| create_comics_click (USER) | Header, Footer, Home hero, About Us | location |
| header_my_comics_click | Header "My Comics" icon | location |
| my_cart_click | Header cart icon | cart_count |
| footer_link_click | Footer links (home, about_us, contact_us, faq, privacy_policy, terms_and_conditions, library, create_comic, for_student, for_teacher, for_parent) | link_name |
| social_link_click | Footer + About Us team | platform, location |
| newsletter_subscribe_click (USER) | Footer "Subscribe" | location |
| home_browse_library_click, download_app_click | Home | store, location |

## Subscription
| Event | Where | Params |
|---|---|---|
| subscribe_click (USER) | Subscription plans (all plan buttons + Founding Teacher) | plan_name, price_id, plan_type, action, has_current_subscription |
| subscribe_change_confirm_click (USER) | Upgrade/downgrade modal | change_mode, change_direction |

## Create comic
| Event | Where | Params |
|---|---|---|
| convert_to_prompt_click (USER) | Step 0 | subject, grade, country, theme, style, show_text_in_image |
| generate_comic_part_click | Step 1 "Generate Comic for Part N" | comic_id, part_number, total_parts |
| json_script_edited | Step 2 JSON script - first edit per part | comic_id, part_number |
| generate_my_comic_click | Step 2 | script_edited, script_changed |
| generate_comic_pdf_click | Comic preview | total_images |
| final_submit_click (USER) | Step 4 | comic_id, part_number |
| go_to_my_comics_click | Existing-comic box, Step 4 | location |

## My comics / bundles
my_comics_resume_click, my_comics_details_click, bundle_comic_select_click (action, selected_count), bundle_comic_select_all_click, create_bundle_click, bundle_popup_create_click (USER; selected_count, concept, bundle_price), comic_details_part_click

## Dashboard (institute)
dashboard_import_click, dashboard_import_submit_click, dashboard_add_click, dashboard_add_student_submit_click, dashboard_add_by_username_click, dashboard_add_by_username_submit_click, dashboard_download_click, dashboard_remove_all_click, dashboard_view_learning_activity_click, dashboard_reset_password_click, dashboard_remove_user_click, dashboard_remove_confirm_click

## Student activity
student_activity_view_click, parent_view_activity_click

## Marketplace / cart
marketplace_view_bundle_click, add_to_cart_click, cart_remove_click, checkout_click (USER; cart_count, value, currency, bundle_ids), checkout_done (transaction_id, payment_status - once per Stripe session)

## My profile
my_profile_tab_click (tab_name) + my_profile_<tab>_click, cancel_subscription_click, cancel_subscription_confirm_click, cancel_subscription_backend_confirmed, cancel_subscription_status_updated, cancel_subscription_failed, invoice_download_click, transaction_download_click, manage_payment_method_click (USER), manage_stripe_account_click (USER), my_purchases_open_click, purchased_comic_read_click, purchased_comic_pdf_click, comic_reader_tab_click (reader / faq / facts / quiz / hardcore), my_sales_go_to_dashboard_click

## Scroll
`screen_scroll_depth` at 25/50/75/90/100 % with `screen_name`:
create_comic_comic_screen, create_comic_comic_thumbnails, create_comic_quiz_screen, my_comics_screen, comic_details_screen, comic_reader_<tab>

## GA4 setup
Admin -> Custom definitions -> register event-scoped dimensions for the params you want in reports
(e.g. screen_name, percent_scrolled, app_user_id, user_role, plan_name, script_edited, tab_name, location).
Check live in Admin -> DebugView (install the "Google Analytics Debugger" Chrome extension).
