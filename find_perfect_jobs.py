import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Searching WeWorkRemotely for 'AI Prompt' and 'Data Annotator'...")
        # Searching specifically for jobs that often don't require heavy coding
        await page.goto("https://weworkremotely.com/remote-jobs/search?term=ai+prompt")
        await page.wait_for_timeout(2000)
        
        links = []
        job_elements = await page.query_selector_all('li.feature a, li.normal a')
        for el in job_elements:
            href = await el.get_attribute('href')
            if href and '/remote-jobs/' in href:
                title_el = await el.query_selector('.title')
                company_el = await el.query_selector('.company')
                if title_el and company_el:
                    title = await title_el.inner_text()
                    company = await company_el.inner_text()
                    links.append({
                        'title': title.strip(),
                        'company': company.strip(),
                        'url': 'https://weworkremotely.com' + href
                    })

        # Try another query if not enough
        if len(links) < 3:
            await page.goto("https://weworkremotely.com/remote-jobs/search?term=ai+annotator")
            await page.wait_for_timeout(2000)
            job_elements = await page.query_selector_all('li.feature a, li.normal a')
            for el in job_elements:
                href = await el.get_attribute('href')
                if href and '/remote-jobs/' in href:
                    title_el = await el.query_selector('.title')
                    if title_el:
                        title = await title_el.inner_text()
                        links.append({
                            'title': title.strip(),
                            'company': "Unknown",
                            'url': 'https://weworkremotely.com' + href
                        })

        print(f"Found {len(links)} jobs. Analyzing the most relevant ones...")
        
        # Analyze up to 4 jobs
        for job in links[:4]:
            print(f"\n=====================================")
            print(f"TITLE: {job['title']}")
            print(f"COMPANY: {job['company']}")
            print(f"URL: {job['url']}")
            print(f"=====================================")
            await page.goto(job['url'])
            await page.wait_for_timeout(1000)
            
            desc_el = await page.query_selector('.listing-container')
            if not desc_el:
                desc_el = await page.query_selector('body')
                
            if desc_el:
                text = await desc_el.inner_text()
                # Print the first 2500 characters to get a good sense of requirements
                print(text[:2500])
            print("...[TRUNCATED]")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
