import json,csv,urllib.parse as up,collections
B={x['id']:x for x in json.load(open('data/snapshot-before.json'))}
A={x['id']:x for x in json.load(open('data/snapshot-after.json'))}
YB={x['id']:x for x in json.load(open('data/yoast-before.json'))}
YA={x['id']:x for x in json.load(open('data/yoast-after.json'))}
S=json.load(open('data/sitemap-after.json'))
n=lambda u: up.unquote(u or '').rstrip('/')
smap={n(u['loc']):u for u in S['urls']}
TARGET=('tp_product','post','tp_project')
tgt=[i for i,x in B.items() if x['type'] in TARGET]
def tname(t): return {'tp_product':'product','post':'post','tp_project':'project'}.get(t,t)
# ---- inventory CSV (all 78 published items, after state)
with open('seo-url-inventory.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f); w.writerow(['id','content_group','post_type','lang','status','title','permalink','http_status','canonical','canonical_matches','indexability','in_sitemap','words','internal_links','content_imgs','imgs_without_alt','focus_keyphrase','seo_title','meta_description','meta_desc_len','yoast_seo_offline','yoast_seo_offline_score','yoast_readability_offline','schema_types','audited_and_optimized'])
    for i,x in A.items():
        s=smap.get(n(x['permalink'])); y=YA[i]
        w.writerow([i,tname(x['type']) if x['type'] in TARGET else 'other (inventory only)',x['type'],x['lang'],'publish',x['title'],x['permalink'],s['status'] if s else '',s['canonical'] if s else x['canonical_rendered'],s['canonicalMatches'] if s else '', 'noindex' if x['robots'].get('index')=='noindex' else 'index', 'yes' if s else 'no',x['words'],x['internal_links'],x['content_imgs'],x['content_imgs_noalt'],x['focuskw'],x['seo_title_rendered'],x['metadesc_rendered'],len(x['metadesc_rendered'] or ''),y['seo'],y['seo_score'] if y['seo']!='none' else '',y['read'],'Article,WebPage,BreadcrumbList' if x['type']=='post' else 'WebPage,BreadcrumbList (Yoast graph)','yes' if x['type'] in TARGET else 'no'])
# ---- changes CSV
with open('seo-changes.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f); w.writerow(['id','group','lang','permalink','focus_before','focus_after','seo_title_before','seo_title_after','meta_desc_before','meta_desc_after','robots_before','robots_after','content_changed','internal_links_before','internal_links_after','yoast_seo_before','yoast_seo_after','yoast_readability_before','yoast_readability_after'])
    for i in tgt:
        b,a=B[i],A[i]
        w.writerow([i,tname(b['type']),b['lang'],a['permalink'],b['focuskw'],a['focuskw'],b['seo_title_rendered'],a['seo_title_rendered'],b['metadesc_rendered'],a['metadesc_rendered'],b['robots'].get('index'),a['robots'].get('index'),'yes' if b['content_sha1']!=a['content_sha1'] else 'no',b['internal_links'],a['internal_links'],YB[i]['seo'],YA[i]['seo'],YB[i]['read'],YA[i]['read']])
# ---- stats
st={}
st['audited']=collections.Counter(tname(B[i]['type']) for i in tgt)
st['inventory_total']=len(B)
st['no_focus_before']=sum(1 for i in tgt if not B[i]['focuskw']); st['no_focus_after']=sum(1 for i in tgt if not A[i]['focuskw'])
st['no_desc_before']=sum(1 for i in tgt if not B[i]['metadesc_rendered']); st['no_desc_after']=sum(1 for i in tgt if not A[i]['metadesc_rendered'])
st['no_custom_title_before']=sum(1 for i in tgt if not B[i]['seo_title_meta']); st['no_custom_title_after']=sum(1 for i in tgt if not A[i]['seo_title_rendered'])
st['zero_internal_links_before']=sum(1 for i in tgt if B[i]['internal_links']==0); st['zero_internal_links_after']=sum(1 for i in tgt if A[i]['internal_links']==0)
st['changed_content']=sum(1 for i in tgt if B[i]['content_sha1']!=A[i]['content_sha1'])
st['changed_any']=len(tgt)
st['noindexed']=[i for i in tgt if A[i]['robots'].get('index')=='noindex']
for k,Y in (('before',YB),('after',YA)):
    st['seo_'+k]=collections.Counter(Y[i]['seo'] for i in tgt); st['read_'+k]=collections.Counter(Y[i]['read'] for i in tgt)
    st['seo_scored_'+k]=sum(1 for i in tgt if Y[i]['seo']!='none')
print(json.dumps(st,ensure_ascii=False,default=lambda o:dict(o)))
print('titles >600px after:',[i for i in tgt if YA[i]['title_width']>600 and A[i]['robots'].get('index')=='index'])
print('orange/red SEO after:',[(i,YA[i]['seo'],YA[i]['seo_score']) for i in tgt if YA[i]['seo'] in('orange','red')])
print('readability not green after:',[(i,YA[i]['read'],YA[i]['read_score']) for i in tgt if YA[i]['read']!='green'])
