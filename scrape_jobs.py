import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Searching WeWorkRemotely for 'AI Prompt'...")
        await page.goto("https://weworkremotely.com/remote-jobs/search?term=ai+prompt")
        
        job_links = await page.query_selector_all('li.feature a, li.normal a')
        
        found = 0
        print("\n--- RESULTS ---")
        for link in job_links:
            title_elem = await link.query_selector('.title')
            company_elem = await link.query_selector('.company')
            if title_elem and company_elem:
                title = await title_elem.inner_text()
                company = await company_elem.inner_text()
                href = await link.get_attribute('href')
                # Skip random links that are not jobs
                if "/remote-jobs/" in href:
                    print(f"Title: {title.strip()}\nCompany: {company.strip()}\nLink: https://weworkremotely.com{href}\n")
                    found += 1
            if found >= 5:
                break
                
        if found == 0:
            print("Trying remoteok.com...")
            await page.goto("https://remoteok.com/remote-ai-jobs")
            await page.wait_for_timeout(2000)
            jobs = await page.query_selector_all('tr.job')
            for job in jobs:
                title_elem = await job.query_selector('h2[itemprop="title"]')
                company_elem = await job.query_selector('h3[itemprop="name"]')
                link_elem = await job.query_selector('a[itemprop="url"]')
                if title_elem and company_elem and link_elem:
                    title = await title_elem.inner_text()
                    company = await company_elem.inner_text()
                    href = await link_elem.get_attribute('href')
                    print(f"Title: {title.strip()}\nCompany: {company.strip()}\nLink: https://remoteok.com{href}\n")
                    found += 1
                if found >= 5:
                    break
                    
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
