import { EventData, Page } from '@nativescript/core';
import { MainViewModel } from './main-view-model';

export function navigatingTo(args: EventData) {
    try {
        const page = <Page>args.object;
        const viewModel = new MainViewModel();
        page.bindingContext = viewModel;

        // Set up error boundary
        page.on('error', (args: EventData) => {
            console.error('Page error:', args);
            viewModel.handleError(args);
        });

        // Initialize loading state
        viewModel.isLoading = true;
        
        // Simulate async data loading
        setTimeout(() => {
            viewModel.isLoading = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to initialize page:', error);
        // Show error UI
        const page = <Page>args.object;
        page.bindingContext = { hasError: true, errorMessage: error.message };
    }
}