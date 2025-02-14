
export default function Footer() {
    return (
        <footer>
            <div className="container text-center border-t dark:border-neutral-700 py-16">
                <p className="text-xs">
                    &copy; 2025 nexusA.
                </p>
                <div className="mt-4">
                    <p className="text-xs">
                        Built by @san__42
                    </p>
                    {/* <p className='mt-8 text-xs'>
                        <Link href="/portfolio" className="hover:underline underline-offset-2">
                            portfolio here
                        </Link>
                    </p> */}
                </div>
            </div>

            <p className="text-xs text-right m-2">
                NB: This app is a work in progress.
            </p>
        </footer >
    )
}